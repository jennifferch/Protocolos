/**
 * CodeRunnerContainer - a process that is forked off by CodeRunner to run an
 * instance of script. We listen for new code via IPC and execute
 * the code in a vm so that we can redirect console and do other neat tricks.
 */
var vm = require('vm');
var intercept = require("intercept-stdout");

// we use this to intercept stdout in this module and
// then pass that same information out to the IPC
var interceptor = intercept(function(txt) {
    process.send(txt);
});

process.on('message', function(message) {

  // Execute code!
  if ( message && message.type && message.type == 'code' ) {
    var code = message.data;
    var sandbox = {
      require: require,
      console: console
    };
    vm.runInNewContext( code, sandbox );
  }
});

