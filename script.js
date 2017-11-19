var fsPrompt = "user@ldgrp:~$";
var fsWelcomeMsg = "";
var fsCommands = {}

fsCommands['help'] = function(){
    var output = 
    "<div><ul>" +
    "<li><strong>help</strong> - display this help</li>" +
    "<li><strong>ls</strong> - list directory contents</li>" +
    "<li><strong>cat</strong> - displays the contents of a file</li>" +
    "<li><strong>pwd</strong> - displays the name of the working directory</li>" +
    "</ul></div>";
    return output;
}

fsCommands['ls'] = function(){
    return '<p>helloworld.txt</p>';
}

fsCommands['cat'] = function(args){
    if(!args[0]) 
        return '<br/>';
    if(args[0] == 'helloworld.txt') 
        return '<p>Hello World!</p>';
    else
        return '<p>cat: ' + args[0] + ': No such file or directory</p>';
}

fsCommands['pwd'] = function(){
    return '<p>/home/ldgrp</p>';
}

var shell = new Shell(fsCommands, fsPrompt, fsWelcomeMsg);

var terminal = new Terminal(document.getElementById("term1"), shell);