const useState = React.useState;
const MEGABYTE = 1024*1024;

const Screen = Object.freeze({
	Main:"main", Settings:"settings", About:"about", Install:"install"
})

const supportedLanguages = [ "en", "de" ];
const LOCALSTORAGE_LANGUAGE = "language"
var strings = {}
function template(templ, ...params) {
	if (templ) {
		return Mustache.render(templ, Object.fromEntries(params.entries()))
	} else {
		return ""
	}
}

{
	let cssvars = [
		"--navbar-color",
		"--button-color",
		"--navbar-hover-color",
		"--button-hover-color",
		"--navbar-active-color",
		"--border-color",
		"--background-color",
		"--text-color"
	]
	for (const v of cssvars) {
		const col = window.localStorage.getItem(v)
		if (col) {
			document.documentElement.style.setProperty(v, col)
		}
	}
}





function roundDecimals(num, dec) {
	return (Math.round(num * Math.pow(10,dec)) / Math.pow(10,dec)).toString()
}




function Navbar(props) {
	function install() {
		props.setScreen(Screen.Install)
		//console.log("Installieren")
	}
	function settings() {
		props.setScreen(Screen.Settings)
		//console.log("Einstellungen")
	}
	function main() {
		props.setScreen(Screen.Main)
		//console.log("Main")
	}
	function about() {
		props.setScreen(Screen.About)
		//console.log("About")
	}
	return (
        <div className="navbar">
            <button type="button" onClick={main} className="navitem">{strings.game}</button>
            <button type="button" onClick={settings} className="navitem">{strings.settings}</button>
            <button type="button" onClick={about} className="navitem">{strings.about}</button>
            <button type="button" onClick={install} className="navitem">{strings.install}</button>
		</div>
	)
}


function MainScreen() {
	return (
		<div>
			<h2>{strings.appname}</h2>
			
		</div>
	)
}


class ColorPicker extends React.Component {
	constructor(props) {
		super(props);
	}
	
	render() {
		return (
			<div className="color-picker">
				<label htmlFor={this.props.name}>{this.props.name}</label>
				<input type="color" id={this.props.name} onInput={(e) => {
					document.documentElement.style.setProperty(this.props.property, e.target.value)
					window.localStorage.setItem(this.props.property, e.target.value)
					this.forceUpdate()
				}} value={getComputedStyle(document.documentElement).getPropertyValue(this.props.property)}></input>
			</div>
		)
	}
}



class StorageComponent extends React.Component {
	constructor(props) {
		super(props);
		this.state = {estimate: {usage: 0, quota: 0}, persistent: false}
		navigator.storage.persisted().then((persistent) => {
			this.setState({estimate: this.state.estimate, persistent: persistent})
		})
		navigator.storage.estimate().then((estimate) => {
			this.setState({estimate: estimate, persistent: this.state.persistent})
		})
		this.storagelistener = () => {
			navigator.storage.estimate().then((estimate) => {
				this.setState({estimate: estimate, persistent: this.state.persistent})
				this.forceUpdate()
			})
		}
	}
	
	
	
	componentDidMount() {
		window.addEventListener("storage", this.storagelistener)
	}
	
	componentWillUnmount() {
		window.removeEventListener("storage", this.storagelistener)
	}
	
	render() {
		let pbutton;
		pbutton = this.state.persistent ? null : <button onClick={() => navigator.storage.persist().then((p) => this.setState({estimate: this.state.estimate, persistent: p}))}>{strings.makePersistent}</button>
		return (
			<div>
				<h2>{strings.storage}</h2>
				<p className="nowrap">{template(strings.usage, roundDecimals(this.state.estimate.usage/MEGABYTE, 2), roundDecimals(this.state.estimate.quota/MEGABYTE, 2))}</p>
				<div>
					{template(strings.persistent, this.state.persistent ? strings.yes : strings.no)}
					<Spoiler text={strings.explanation}>{strings.persistentExplain}</Spoiler>
				</div>
				{pbutton}
				<button onClick={ () => {
					if (confirm(strings.deleteAll+"?")) {
						window.localStorage.clear();
						if (caches) {
							caches.keys().then((keys) => {
								for (const k of keys) {
									caches.delete(k)
								}
							})
						}
						if (indexedDB && indexedDB.databases) {
							indexedDB.databases.then((dbs) => {
								for (const db of dbs) {
									indexedDB.deleteDatabase(db)
								}
							})
						}
					}
				}}>{strings.deleteAll}</button>
				<button onClick={() => {
					if (Clipboard) {
						let json = "{"
						for (var i = 0; i < localStorage.length; i++) {
							const key = localStorage.key(i)
							json += JSON.stringify(key)+":"+JSON.stringify(localStorage.getItem(key))
						}
						json += "}"
						navigator.clipboard.writeText(json).then(() => alert(strings.settingsExported))
					}
				}}>{strings.exportSettings}</button>
				<button onClick={() => {
					let json = prompt()
					try {
						json = JSON.parse(json)
						for (const [key, value] of Object.entries(json)) {
							localStorage.setItem(key, value)
						}
						location.reload()
					} catch(error) {console.log(error)}
				}}>{strings.importSettings}</button>
			</div>
		)
	}

}


function Spoiler(props) {
	const [hidden, setHidden] = useState(true);
	return (
		<div>
			<button onClick={() => {
				setHidden(! hidden)
			}} className="spoiler">{props.text || strings.spoiler}</button>
			<div style={{
				height: hidden ? "0px" : "auto",
				overflow: "hidden",
				border: hidden ? "none" : "1px dashed var(--border-color)"}}>
				<div className="spoiler-content">{props.children}</div>
			</div>
		</div>
	)
}

function SettingsScreen(props) {
	let languageNames = new Intl.DisplayNames([props.language], {type: 'language'});
	return (
		<div className="settings">
			<div>
				<h2>{strings.settings}</h2>
				<h3>Sprache</h3>
				<p>
					{supportedLanguages.map((l) => <button className="lang-button" key={l} onClick={() => props.setLanguage(l)}>{languageNames.of(l)}</button>)}
				</p>
			</div>
			<StorageComponent/>
			<div>
				<h2>{strings.theme}</h2>
				<Spoiler>
					<ColorPicker name={strings.backgroundColor} property="--background-color"/>
					<ColorPicker name={strings.textColor} property="--text-color"/>
					<ColorPicker name={strings.navbarColor} property="--navbar-color"/>
					<ColorPicker name={strings.navbarHoverColor} property="--navbar-hover-color"/>
					<ColorPicker name={strings.navbarActiveColor} property="--navbar-active-color"/>
					<ColorPicker name={strings.borderColor} property="--border-color"/>
					<ColorPicker name={strings.buttonColor} property="--button-color"/>
					<ColorPicker name={strings.buttonHoverColor} property="--button-hover-color"/>
				</Spoiler>
			</div>
			<div>
				<h2>{strings.archivements}</h2>
				
			</div>
		</div>
	)
}


function AboutScreen() {
	return (
		<div>
			<h2>{strings.about}</h2>
		</div>
	)
}


function InstallScreen() {
	return (
		<div>
			<h2>{strings.install}</h2>
		</div>
	)
}




function App(props) {
	switch (props.screen) {
		default:
		case Screen.Main:
			return (
				<div className="main">
					<MainScreen/>
				</div>
			)
		case Screen.Settings:
			return (
				<div className="main">
					<SettingsScreen language={props.language} setLanguage={props.setLanguage}/>
				</div>
			)
		case Screen.About:
			return (
				<div className="main">
					<AboutScreen/>
				</div>
			)
		case Screen.Install:
			return (
				<div className="main">
					<InstallScreen/>
				</div>
			)
	}
}





class Container extends React.Component {
	constructor(props) {
		super(props);
		
		let page = new URL(document.URL).searchParams.get("page")
		
		this.state = {screen: (Object.values(Screen).includes(page)) ? page : Screen.Main,
			language: this.checkLanguage(window.localStorage.getItem(LOCALSTORAGE_LANGUAGE) || navigator.language || navigator.userLanguage || (navigator.languages ? navigator.languages[0] : "en"))};
		this.getStrings(this.state.language)
		
		
		
		this.setLanguage = this.setLanguage.bind(this)
		this.setScreen = this.setScreen.bind(this)
		
	}
	
	checkLanguage(lang) {
		if (! supportedLanguages.includes(lang)) {
			return supportedLanguages[0];
		}
		return lang
	}
	
	getStrings(lang) {
		fetch("strings/"+lang+".json")
				.then(response => response.json(), () => console.log("could not get strings file for langage: "+lang))
				.then(data => {
					strings = data
					this.forceUpdate()
					document.title = strings.appname
				}, () => "language file JSON syntax error");
	}
	
	setLanguage(lang) {
		lang = this.checkLanguage(lang)
		if (lang !== this.state.language) {
			this.getStrings(lang)
		}
		this.setState({screen: this.state.screen, language: lang})
		window.localStorage.setItem(LOCALSTORAGE_LANGUAGE, lang)
	}
	
	
	setScreen(screen) {
		this.setState({screen: screen, language: this.state.language})
		if (screen === Screen.Main) {
			let url = new URL(document.URL)
			url.searchParams.delete("page")
			history.replaceState(null, document.title, url.toString());
		} else {
			let url = new URL(document.URL)
			url.searchParams.set("page", screen)
			history.replaceState(null, document.title, url.toString());
		}
	}
	
	render() {
		return (
			<div>
				<Navbar setScreen={this.setScreen} screen={this.state.screen}/>
				<App screen={this.state.screen} setLanguage={this.setLanguage} language={this.state.language}/>
			</div>
		)
	}
}







ReactDOM.render(<Container/>, document.querySelector('#container'));
