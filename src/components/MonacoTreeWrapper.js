import React from 'react';
import { MonacoTree, TreeDnD, generateDirectoryTree, FileTemplate, directoryListing, Action, Separator } from "../monaco-tree";

export default class MonacoTreeWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            rootNode: null,
            treeConfig: null
        };
    }

    componentDidMount() {

        const treeConfig = {
            dataSource: {
                /**
                 * Returns the unique identifier of the given element.
                 * No more than one element may use a given identifier.
                 */
                getId: function(tree, element){
                    return element.key;
                },
        
                /**
                 * Returns a boolean value indicating whether the element has children.
                 */
                hasChildren: function(tree, element){
                    return element.isDirectory;
                },
        
                /**
                 * Returns the element's children as an array in a promise.
                 */
                getChildren: function(tree, element){
                    return Promise.resolve(element.children);
                },
        
                /**
                 * Returns the element's parent in a promise.
                 */
                getParent: function(tree, element){
                    return Promise.resolve(element.parent);
                },
            },
            renderer: {
                getHeight: function(tree, element){
                    return 24;
                },
                renderTemplate: function(tree, templateId, container) {
                    return new FileTemplate(container);
                },
                renderElement: function(tree, element, templateId, templateData) {
                    templateData.set(element);
                },
                disposeTemplate: function(tree, templateId, templateData) {
                    FileTemplate.dispose();
                }
            },

            //tree config requires a controller property but we would defer its initialisation
            //to be done by the MonacoTree component
            //controller: createController(this, this.getActions.bind(this), true),
            dnd: new TreeDnD()
        };


        this.setState({
            rootNode: generateDirectoryTree(this.props.fileList || directoryListing, 'ROOT'),
            treeConfig: treeConfig
        });
    }

    /**
     * 控制右键菜单内容
     */
    getActions = (file, event) => {
        const actions = [];
        // 暂不开放自定义右键菜单
        return actions;

        // Directory options
        if (file.isDirectory) {

            actions.push(new Action("1", "New File", "", true, () => {
                console.log("action New File on " + file.name);

            }));

            //menu separator
            actions.push(new Separator());

            actions.push(new Action("2", "New Directory", "", true, () => {
                console.log("action New Directory on " + file.name);

            }));

            actions.push(new Action("3", "Upload Files", "", true, () => {
                console.log("action Upload Files on " + file.name);
                
            }));
            
        }
        
            
        actions.push(new Action("4", "Download", "", true, () => {
            console.log("action Download on " + file.name);
        }));
        
        actions.push(new Action("5", "Delete", "", true, () => {
            console.log("action Delete on " + file.name);
            
        }));


        return actions;
    }

    onClickFile = (file) => {
        if (file.isDirectory) {
            return;
        }
        if (Date.now() - this.lastClickedTime < 200 && this.lastClickedFile === file) {
            clearTimeout(this.timeout);
            this.props.onDoubleClick && this.props.onDoubleClick(file);
            console.log(file.name + " double clicked");
        }
        else {
            this.timeout = setTimeout(() => {
                this.props.onClick && this.props.onClick(file);
                console.log(file.name + " clicked");
            }, 200);
        }
        this.lastClickedTime = Date.now();
        this.lastClickedFile = file;
    }

    render() {
        return (
            <div className="vs-dark show-file-icons show-folder-icons" style={{height: '100%', position: "relative"}}>
                <div className="workspaceContainer">
                    {this.state.rootNode &&
                        <MonacoTree 
                            directory={this.state.rootNode}
                            treeConfig={this.state.treeConfig}
                            getActions={this.getActions}
                            onClickFile={this.onClickFile}
                        />}
                </div>
            </div>
        );
    }
} 