import React from 'react';
import PropTypes from 'prop-types';
import { MonacoTree, TreeDnD, generateDirectoryTree, FileTemplate, directoryListing, Action, Separator } from "../monaco-tree";
import { getFileIconLabel } from "../monaco-tree/file-utils";

const rootName = '_ROOT_';

export default class MonacoTreeWrapper extends React.Component {

    static propTypes = {
        // 文件列表
        files: PropTypes.array,
        // 文件的单击事件，接收参数：filePath, file, fileIcon
        onClick: PropTypes.func,
        // 文件的双击事件，接收参数：filePath, file, fileIcon
        onDoubleClick: PropTypes.func,
    };

    static defaultProps = {
    };

    constructor(props) {
        super(props);
        this.state = {
            rootNode: null,
            treeConfig: null
        };
        this.ref = React.createRef();
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
            rootNode: generateDirectoryTree(this.props.files || directoryListing, rootName),
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

    // 文件单击事件
    onClickFile = (file) => {
        if (file.isDirectory) {
            return;
        }
        const filePath = this.getFilePathByFileNode(file);
        const fileIcon = getFileIconLabel(file.name, file.isDirectory);
        if (Date.now() - this.lastClickedTime < 200 && this.lastClickedFile === file) {
            clearTimeout(this.timeout);
            this.props.onDoubleClick && this.props.onDoubleClick(filePath, file, fileIcon);
            console.log(file.name + " double clicked");
        }
        else {
            this.timeout = setTimeout(() => {
                this.props.onClick && this.props.onClick(filePath, file, fileIcon);
                console.log(file.name + " clicked");
            }, 200);
        }
        this.lastClickedTime = Date.now();
        this.lastClickedFile = file;
    }


    /**
     * 将filePath转成 TreeNode 格式
     * @param {*} filePath 
     */
     getFileNodeByFilePath = (filePath) => {
        const node = generateDirectoryTree([filePath], rootName);
        let result = node;
        while (result.children && result.children[0]) {
            result = result.children[0];
        }
        return result;
    }

    /**
     * 将fileNode转换成字符串格式的filePath
     * @param {*} file 
     * @returns 
     */
    getFilePathByFileNode = (file) => {
        const files = [file.name];
        let tempFile = file;
        while(tempFile.parent && tempFile.parent.name !== rootName) {
            tempFile = tempFile.parent;
            files.unshift(tempFile.name);
        }
        const filePath = files.join('/');
        return filePath;
    }

    // 获取底层 tree 实例，上面挂载了很多方法和事件，有需要自取
    getTree = () => {
        if (this.ref && this.ref.current) {
            return this.ref.current.tree;
        }
        return null;
    }

    // 设置当前选中文件
    setSelection = (fileNode) => {
        if (typeof fileNode === 'string') {
            fileNode = this.getFileNodeByFilePath(fileNode);
        }
        const tree = this.getTree();
        if (tree) {
            // 选中文件时自动展开文件夹
            this.expandFolder(fileNode);
            setTimeout(() => {
                // 展开文件夹后立即选中文件会失效，需要延迟一会儿
                tree.model.setSelection([fileNode]);
            }, 0);
        }
    }

    // 获取当前选中文件
    getSelection = () => {
        return this.getTree() && this.getTree().model.getSelection();
    }

    // 底层的递归展开或收起全部文件夹
    _toggleExpandAndCollapseAll = (node, tree, expand = true) => {
        node = node || this.state.rootNode;
        tree = tree || this.getTree();
        if (!tree) {
            return;
        }
        if (node.isDirectory) {
            console.log(node.name)
            tree.model[expand ? 'expand' : 'collapse'](node);
            node.children.forEach(child => {
                // 必须延迟一下，否则不会生效
                setTimeout(() => {
                    this._toggleExpandAndCollapseAll(child, tree, expand);
                }, 0);
            });
        }
    }

    // 递归展开全部文件夹
    expandAll = (node, tree) => {
        this._toggleExpandAndCollapseAll(node, tree, true);
    }

    // 递归收起全部文件夹
    collapseAll = (node, tree) => {
        this._toggleExpandAndCollapseAll(node, tree, false);
    }

    // 底层的展开或收起某个文件夹
    _toggleExpandAndCollapseSingle = (node, expand = true) => {
        const tree = this.getTree();
        if (!tree) {
            return;
        }
        if (typeof node === 'string') {
            node = this.getFileNodeByFilePath(node);
        }
        let parent = node;
        let folders = [];
        while (parent && parent.name !== rootName) {
            folders.push(parent);
            parent = parent.parent;
        }
        // 这里非常坑，递归展开某个子文件夹必须自上而下依次展开，自下而上不生效
        // 另外，展开某个父文件夹后必须setTimeout(fn, 0)后再继续往下执行，否则也不生效
        const execute = (idx = 0) => {
            if (!folders[idx]) {
                return;
            }
            tree.model[expand ? 'expand' : 'collapse'](folders[idx]);
            // 由于框架暂不支持await，所以先蹩脚的这么写
            setTimeout(() => {
                execute(idx + 1);
            }, 0);
        };
        folders = folders.reverse();
        execute();
    }

    // 递归展开某个文件夹
    expandFolder = (filePath) => {
        this._toggleExpandAndCollapseSingle(filePath, true);
    }

    // 递归收起某个文件夹
    collapseFolder = (filePath) => {
        this._toggleExpandAndCollapseSingle(filePath, false);
    }

    render() {
        return <div className="nice-monaco-tree vs-dark show-file-icons show-folder-icons">
            {this.state.rootNode &&
                <MonacoTree 
                    ref={this.ref}
                    directory={this.state.rootNode}
                    treeConfig={this.state.treeConfig}
                    getActions={this.getActions}
                    onClickFile={this.onClickFile}
                />}
        </div>;
    }
} 