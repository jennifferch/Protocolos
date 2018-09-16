export default {
  init: init
};

function init() {

    Blockly.Blocks['console_log_value'] = {
        init: function() {
            this.setColour(290);
            this.appendValueInput("consolevalue")
                .appendField('console.log');
            this.setNextStatement(true);
            this.setPreviousStatement(true);
        }
    };

    Blockly.Blocks['while_button'] = {
        init: function() {
            this.setColour(210);
            this.appendDummyInput()
                .appendField('mientras el botón')
                .appendField(new Blockly.FieldDropdown([
                            ['red', 'red'],
                            ['green', 'green'],
                            ['up', 'up'],
                            ['down', 'down'],
                            ['left', 'left'],
                            ['right', 'right']
                ]), 'BUTTON')
                .appendField('se presiona');
            this.appendStatementInput('DO');
            this.appendDummyInput()
                .appendField('de otra manera');
            this.appendStatementInput('OTHERWISE');
        }
    };

    Blockly.Blocks['if_distance'] = {
        init: function() {
            this.setColour(210);
            this.appendDummyInput()
                .appendField('when')
                .appendField(new Blockly.FieldTextInput('15'), 'DISTANCE')
                .appendField('cm away');
            this.appendStatementInput('DO');
            this.appendDummyInput()
                .appendField('otherwise');
            this.appendStatementInput('OTHERWISE');
        }
    };
}
