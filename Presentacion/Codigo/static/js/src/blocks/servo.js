import _ from 'lodash';

// used to hold context of servos for when blocks is used.
var servoSelector = {};

var crServoMethods = [
    ['girar en sentido horario ↻', 'cw'],
    ['gira en sentido antihorario ↺', 'ccw'],
    ['stops', 'stop'],
];

var stdServoMethods = [
    ['mover a', 'to'],
    ['mover al centro', 'center']
];

var stdMutatorStateFields = {
    "to": ["servoposition"]
};

var crMutatorStateFields = {

}

export default function servo(opts) {
    // initialises the LED object

    this.components = opts.components || null;

    // used to add the returned block definitions to the right categories
    this.categories = {
        "continuous": "actuator",
        "standard": "actuator",
    };
    // this is for the dropdown selector.
    servoSelector = []; // reset between exercises
    this.components.forEach(servo => {
        // get type and push it onto the right group.
        let stype = servo.config.type || null;
        if (stype == null) {
            throw Error("Servo type must be defined in workshop file");
        }

        // the first time we find a new type it will be undefd so make it.
        if (servoSelector[stype] == undefined) {
            servoSelector[stype] = [];
        }

        // now add the items to be put on the selector for later
        servoSelector[stype].push([
            servo.name,
            servo.name
        ]);
    });
};

servo.prototype.blocks = function() {
    let blockdefs = {
        continuous: {
            init: function() {
                this.setColour(65);
                this.appendDummyInput()
                    .appendField('El')
                    .appendField(new Blockly.FieldDropdown(servoSelector.continuous), 'servoobject')
                    .appendField(new Blockly.FieldDropdown(crServoMethods), 'servostate')
                this.setInputsInline(true);
                this.setTooltip("Control a continuous rotation servo");
                this.setNextStatement(true);
                this.setPreviousStatement(true);
            },
            onchange: function(e) {
                // this happens when the interface changes.
            },
        },
        standard: {
            init: function() {
                this.setColour(60);
                this.appendDummyInput()
                    .appendField('El')
                    .appendField(new Blockly.FieldDropdown(servoSelector.standard), 'servoobject')
                    .appendField(new Blockly.FieldDropdown(stdServoMethods), 'servostate')
                this.setInputsInline(true);
                this.setTooltip("Control the position of a standard servo");
                this.setNextStatement(true);
                this.setPreviousStatement(true);
            },
            mutationToDom: function() {
                var container = document.createElement('mutation');
                var servostate = this.getFieldValue('servostate');
                container.setAttribute('servostate', servostate);

                // check if there's special fields we need to save based
                // on the state.
                if (stdMutatorStateFields[servostate]) {
                    stdMutatorStateFields[servostate].forEach(field => {
                        container.setAttribute(field, this.getFieldValue(field));
                    });
                }

                return container;
            },
            domToMutation: function(xmlElement) {
                // restore the state of the block.
                // Determine state which will determine the other fields
                // you'll get and then build the object.
                let options = {};
                options.state = xmlElement.getAttribute('servostate');
                if (stdMutatorStateFields[options.state]) {
                    stdMutatorStateFields[options.state].forEach(field => {
                        options[field] = xmlElement.getAttribute(field);
                    });
                }

                this.shapechange_(options);
            },
            onchange: function(e) {
                this.shapechange_();
            },
            shapechange_: function(options) {
                // change the structure of the block depending on the type
                // of method being called.

                let opts = options || {};
                let state = opts.state || this.getFieldValue('servostate');
                // this happens when the interface changes.
                if (state == "to") {
                    // use the input list to determine how many controllable
                    // inputs there are. 1 means it's just the dropdown
                    // 2 or more means there are other fields added.
                    if (this.inputList.length == 1) {
                        // add the blink items to the block
                        this.appendDummyInput("MOVE")
                            .appendField(' ')
                            .appendField(new Blockly.FieldTextInput('90'), 'servoposition')
                            .appendField('°');
                    } else {
                        // the item already exists, just do a quick range check.
                        let degrees = parseInt(this.getFieldValue('servoposition'));
                        if (degrees > 180 || degrees < 0) {
                            this.setWarningText("Position value must be between 0-180°");
                        } else if (isNaN(degrees)) {
                            this.setWarningText("Position value needs to be a number");
                        } else {
                            this.setWarningText(null);
                        }
                    }
                } else {
                    if (this.inputList.length > 1) {
                        // remove the move to items we've previously added.
                        this.removeInput("MOVE");
                    }
                }
            },
        },
    };

    let returnBlocks = {};

    Object.keys(servoSelector).forEach(servotype => {
        returnBlocks[servotype] = blockdefs[servotype];
    });

    return returnBlocks;
};

servo.prototype.generators = function() {
    var generatordefs = {
        continuous: function(block) {
            var selectedservo = block.getFieldValue('servoobject');
            var servostate = block.getFieldValue('servostate');
            return selectedservo + '.' + servostate + '();\n';
        },

        standard: function(block) {
            var selectedservo = block.getFieldValue('servoobject');
            var servostate = block.getFieldValue('servostate');
            if (servostate === "to") {
                return selectedservo + '.to(' + block.getFieldValue('servoposition') + ');\n';
            } else {
                return selectedservo + '.' + servostate + '();\n';
            }
        },
    }

    let returnGenerators = {};

    Object.keys(servoSelector).forEach(servotype => {
        returnGenerators[servotype] = generatordefs[servotype];
    });

    return returnGenerators;
};


