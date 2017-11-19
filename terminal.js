/*! 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2017 Leo O.
 * Copyright (c) 2014 Martin N.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var KEY_BACKSPACE = 8,
  KEY_TAB = 9,
  KEY_RETURN = 13,
  KEY_LEFT = 37,
  KEY_UP = 38,
  KEY_RIGHT = 39,
  KEY_DOWN = 40;

class Terminal {
  constructor(element, shell) {
    this.element = element;
    this.shell = shell;

    this.buffer = "";
    this.cursorPos = 0;

    this.updateBuffer();

    element.addEventListener("keypress", event => {
      console.log("keypress!");
      if (event.keyCode != 13)
        this.appendCharacter(String.fromCharCode(event.keyCode));
      event.preventDefault();
    });

    element.addEventListener("keydown", event => {
      switch (event.keyCode) {
        case KEY_TAB:
          this.autoCompleteInput(this.buffer.trim());
          event.preventDefault();
          break;
        case KEY_RETURN:
          this.runCommand(this.buffer.trim());
          this.updateBuffer();
          event.preventDefault();
          break;
        case KEY_BACKSPACE:
          this.deleteCharacter();
          event.preventDefault();
          break;
        case KEY_LEFT:
          if (this.cursorPos > 0) this.cursorPos--;
          this.updateBuffer();
          event.preventDefault();
          break;
        case KEY_RIGHT:
          if (this.cursorPos < this.buffer.length) this.cursorPos++;
          this.updateBuffer();
          event.preventDefault();
          break;
        case KEY_UP:
        case KEY_DOWN:
          this.browseHistory(event.keyCode);
          event.preventDefault();
          break;
      }
    });
  }

  resetBuffer(){
    this.element.querySelector(".content").innerHTML +=
      "<span>" +
      this.shell.prompt +
      "</span>" +
      "<span>&nbsp;" +
      this.buffer +
      "</span><br>";
    this.buffer = "";
    this.cursorPos = 0;
  }

  autoCompleteInput(input) {
    var text = input;
    var suggestions = this.shell.autoCompleteInput(
      text.replace(/\s+/g, "")
    );

    if (suggestions.length == 1) {
      this.buffer = suggestions[0];
      this.cursorPos = this.buffer.length;
      this.updateBuffer();
    }
  }

  browseHistory(key) {
    var dir = key == KEY_UP ? -1 : 1;
    var output = this.shell.browseHistory(dir);
    if (!output) this.buffer = output;
    this.updateBuffer();
  }

  runCommand(input) {
    var text = input.trim();
    var output = '';

    output = this.shell.runCommand(text);
    this.resetBuffer();
    if(output) this.element.querySelector(".content").innerHTML += output;
  }

  appendCharacter(char) {
    var left = this.buffer.substring(0, this.cursorPos);
    var right = this.buffer.substring(this.cursorPos, this.buffer.length);
    this.buffer = left + char + right;
    this.cursorPos++;
    this.updateBuffer();
  }

  deleteCharacter(char) {
    if (this.cursorPos - 1 < 0) return;
    var left = this.buffer.substring(0, this.cursorPos - 1);
    var right = this.buffer.substring(this.cursorPos, this.buffer.length);
    this.buffer = left + right;
    this.cursorPos--;
    this.updateBuffer();
  }

  updateBuffer() {
    var prompt = this.shell.prompt;
    var left = "";
    var cursor = "&nbsp;";
    var right = "";

    if (this.cursorPos > 0) left = this.buffer.substring(0, this.cursorPos);
    if (this.cursorPos < this.buffer.length)
      cursor = this.buffer.substring(this.cursorPos, this.cursorPos + 1);
    if (this.cursorPos + 1 < this.buffer.length)
      right = this.buffer.substring(this.cursorPos + 1, this.buffer.length);

    this.element.querySelector(".prompt").innerHTML = prompt;
    this.element.querySelector(".left").innerHTML = left;
    this.element.querySelector(".cursor").innerHTML = cursor;
    this.element.querySelector(".right").innerHTML = right;

    var terminal = this.element;
    terminal.scrollTop = terminal.scrollHeight;
  }
}

class Shell {
  constructor(commands, prompt, welcomeMsg) {
    this.commands = commands;
    this.history = [];
    this.historyIndex = 0;
    this.prompt = prompt;
    this.welcomeMsg = welcomeMsg;
  }

  updateHistory(cmd) {
    this.history.push(cmd);
    this.historyIndex = this.history.length;
  }
  browseHistory(direction) {
    if (direction == -1 && this.historyIndex > 0)
      return this.history[--this.historyIndex];
    if (direction == 1 && this.historyIndex < this.history.length)
      return this.history[++this.historyIndex];
    return false;
  }

  runCommand(text) {
    this.updateHistory(text);

    var text = text.split(" ");
    var cmd = text[0];
    var args = text.slice(1, text.length);
    if (cmd) {
      if (cmd in this.commands) return this.commands[cmd](args);
      else return "<p>Error</p>";
    } else return false;
  }

  autoCompleteInput(text) {
    var re = new RegExp("^" + text, "ig"),
      suggestions = [];

    for (var cmd in this.commands) {
      if (this.commands.hasOwnProperty(cmd) && cmd.match(re))
        suggestions.push(cmd);
    }

    return suggestions;
  }
}
