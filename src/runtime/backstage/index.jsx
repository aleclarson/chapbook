import {h, render, Component} from 'preact';
import {init as initRecorder} from './history/recorder';
import History from './history';
import Notes from './notes';
import State from './state';
import Style from './style';
import Tabs from './tabs';
import './index.css';

export class Backstage extends Component {
	constructor(props) {
		super(props);
		this.state = {open: true};
	}

	setBodyClass() {
		if (this.state.open) {
			document.body.classList.add('backstage-visible');
		} else {
			document.body.classList.remove('backstage-visible');
		}
	}

	toggle() {
		this.setState({open: !this.state.open});
	}

	render() {
		const label = this.state.open
			? {icon: '\u2192', text: 'Close'}
			: {icon: '\u2190', text: 'Open'};

		return (
			<div id="backstage" class={this.state.open && 'open'}>
				<button
					onClick={e => this.toggle()}
					title={label.text + ' backstage panel'}
					class="toggle-visibility"
				>
					{label.icon}
				</button>
				<Tabs>
					<State label="State" />
					<History label="History" />
					<Style label="Style" />
					<Notes label="Notes" />
				</Tabs>
			</div>
		);
	}

	componentDidMount() {
		this.setBodyClass();
	}

	componentDidUpdate() {
		this.setBodyClass();
	}
}

export function init() {
	initRecorder();
	render(<Backstage />, document.body);
}
