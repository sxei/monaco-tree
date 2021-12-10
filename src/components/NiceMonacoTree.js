import React from 'react';
import ReactDOM from 'react-dom';
import MonacoTreeWrapper from './MonacoTreeWrapper';
import {Action, Separator } from "../monaco-tree";

import '../assets/main.css';
import '../assets/vscode-icons.css';

const NiceMonacoTree = {
    init: (el, props) => {
        const ref = React.createRef();
        ReactDOM.render(<MonacoTreeWrapper ref={ref} {...props}/> , el);
        return ref.current;
    },
    Action,
    Separator,
};
export default NiceMonacoTree;


