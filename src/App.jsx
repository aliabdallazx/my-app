import "./App.css";
import MainContent from "./components/MainContent";

function App() {
	return (
		<div className="app-shell">
			<header className="navbar">
				<a className="brand" href="#home" aria-label="Rwanda prayer times home">
					<span className="brand-mark">PT</span>
					<span>
						<strong>Prayer Times</strong>
						<small>Rwanda</small>
					</span>
				</a>

				<nav className="nav-links" aria-label="Primary navigation">
					<a href="#home">Home</a>
					<a href="#schedule">Schedule</a>
					<a href="#location">Location</a>
				</nav>
			</header>

			<main id="home" className="main-layout">
				<MainContent />
			</main>

			<footer className="footer">
				<p>Designed and developed by ALZAIM ALI</p>
			</footer>
		</div>
	);
}

export default App;
