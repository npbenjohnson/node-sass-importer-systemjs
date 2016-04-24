var path = require('path')
var System = require('systemjs')
var fs = require('fs')
var config = require(process.cwd() + '/package')

var config = config.jspm || config.systemJs
if(config != null)
    config = config.configFile
config = config || './config.js'
eval(fs.readFileSync(config, 'utf-8'))

// This is a resolver in the format lib-sass excepts to resolve imports
// turns @import 'sys:[insert systemjs reference here]' into a file path
function resolvePath(current, previous, done) {
    if (current.slice(0, 4) === 'sys:' || current.slice(0,5) === 'jspm:') {
        // Replace sys:
        current = current.replace(/^(sys:|jspm:)/, '');
        System.normalize(current).then(function (url) {
            // normalize systemjs file:// value and return to node-sass
            done({ file: fromFileURL(url) });
        }).catch(function (ex) {
            done(new Error('SystemJs Error: ' + ex));
        });
    }
    else {
        done(); // use default
    }
}

function fromFileURL(url) {
    // Get rid of any auto-extensions systemjs might have added
    url = url.replace(/\.js$|\.ts$/, '');
    // Add file extension if import doesn't have one
    if (!url.match(/\.s(c|a)ss/)) 
        url += '.scss';
    // Remove file://, standardize path seperator, and remove extra leading '\\' if present
    return decodeURIComponent(url.replace(/^file:\/\//i, '')).replace('/', path.sep).replace(/^\\/,'');
}

module.exports = resolvePath