import React from 'react';
import ReactDOM from 'react-dom';
import MonacoTreeWrapper from './MonacoTreeWrapper';
import {Action, Separator } from "../monaco-tree";

import '../assets/main.css';
import '../assets/vscode-icons.css';

const NiceMonacoTree = {
    init: (el, props) => {
        ReactDOM.render(<MonacoTreeWrapper {...props}/> , el);
    },
    Action,
    Separator,
};
export default NiceMonacoTree;


