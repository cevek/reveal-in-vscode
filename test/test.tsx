import { init } from '../src/index';
import * as React from 'react';
import * as ReactDOM from 'react-dom';


function App() {
    return (
        <h1>
            <div>Hello</div>
            <div>
                Hey
                <Bar />
                <Foo />
            </div>
        </h1>
    );
}

function Foo() {
    return <span>foo</span>;
}

function Bar() {
    return <span>bar</span>;
}

ReactDOM.render(<App />, document.getElementById('root'));
