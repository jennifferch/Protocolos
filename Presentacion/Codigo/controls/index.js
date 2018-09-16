
var callbacks = {}

var button = module.exports = {

  /**
   * on - Register a button press handler
   *
   * @param  {string} button name
   * @param  {function} callback()
   */
  on: function(button, callback) {
    callbacks[ button + '_down' ] = callbacks[ button + '_down' ] || []
    callbacks[ button + '_down' ].push( callback )
  },

  /**
   * off - Register a button release handler
   *
   * @param  {string} button name
   * @param  {function} callback()
   */
  off: function(button, callback) {
    callbacks[ button + '_up' ] = callbacks[ button + '_up' ] || []
    callbacks[ button + '_up' ].push( callback )
  },


  /**
   * trigger - Manually trigger a button event
   *
   * @param  {string} button name
   * @param  {string} state - 'up' or 'down'
   */
  trigger: function(button, state) {
    state = state || 'down';
    var callbackName = button + '_' + state;
    if ( callbacks[ callbackName ] ) {
      // Run instances of registed callbacks
      for (var i=0;i<callbacks[ callbackName ].length;i++) {
        callbacks[ callbackName ][ i ]();
      }
    }
  }

}

// IPC listener
process.on('message', function(message) {
  if (!message || !message.button) return;
  button.trigger( message.button, message.state );
});
