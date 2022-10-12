// this signs-up this script to run on the client-side of the Minecraft Bedrock Edition engine
const systemClient = client.registerSystem(0, 0);

// the client runs this as soon as the scripts are all fully loaded
systemClient.initialize = function() {
    // turn on logging of information, warnings, and errors
    const scriptLoggerConfig = this.createEventData("minecraft:script_logger_config");
    scriptLoggerConfig.data.log_errors = true;
    scriptLoggerConfig.data.log_information = true;
    scriptLoggerConfig.data.log_warnings = true;
    this.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);

    // register event data, register components, register queries, listen for events, . . .

    this.counter = 0;
};

// the client runs this update function 20 times per second
systemClient.update = function() {
    // print hello world to the world's chat once per second
    this.counter++;
    if (this.counter === 20) {
        this.log("Client!");
        this.counter = 0;
    }

    // update other stuff . . .
};

// the client only runs this when the world is shutting down
systemClient.shutdown = function() {
    // clean up stuff . . .
};

// This is just a helper function that simplifies logging data to the console.
systemClient.log = function(...items) {
    // Convert every parameter into a legible string and collect them into an array.
	const toString = item => {
		switch(Object.prototype.toString.call(item)) {
			case '[object Undefined]':
				return 'undefined';
			case '[object Null]':
				return 'null';
			case '[object String]':
				return `"${item}"`;
			case '[object Array]':
				const array = item.map(toString);
				return `[${array.join(', ')}]`;
			case '[object Object]':
				const object = Object.keys(item).map(key => `${key}: ${toString(item[key])}`);
				return `{${object.join(', ')}}`;
			case '[object Function]':
				return item.toString();
			default:
				return item;
		}
    }
    
    // Join the string array items into a single string and print it to the world's chat.
    const chatEvent = this.createEventData("minecraft:display_chat_event");
    chatEvent.data.message = items.map(toString).join(' ');
    this.broadcastEvent("minecraft:display_chat_event", chatEvent);
}
