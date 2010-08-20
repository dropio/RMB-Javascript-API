# Drop.io Rich Media Backbone Javascript API

This is the official Javascript API for the drop.io Rich Media Backbone (RMB). Using the API will allow you to create and manage drops, assets, pingbacks & more all via Javascript.

## API Key

You will need an API key to interact with the RMB. The RMB is still in alpha development and testing, but you can sign up for a key at:
[mybackbone.drop.io](http://mybackbone.drop.io/)

## Instantiation

First, you will need to include two files: the Javascript file and the cross-domain receiver, which is used to communicate with the API. By default the cross-domain file should be located at your server root, e.g. `/DropioJSClientXDReceiver.html`, but the location can be customized upon initialization.

To create a basic instance with all the defaults:

    var api = new DropioApiClient("YOUR_API_KEY");

To customize the location of the cross-domain file and pass additional options, use:

    var api = new DropioApiClient("YOUR_API_KEY", "CUSTOM_PATH_TO_XD_RECEIVER", { option1 : "value1" });

The acceptable options to be passed in are `version` as a string (which defaults to `"3.0"`) and `call_type` (which defaults to `"iframe"`, but could also be `"ajax"`).

## Usage

At this point you have a working instance of the API client. All calls to the instance will take two arguments: the parameters of the request, and a callback function that will be called after the request is complete.

    var params = { name : "foobar" };
    
    var callback = function(response, status) {
      alert(status); // true, if successful
      alert(response); // JSON response object about the drop named "foobar"
    };
    
    api.getDrop(params, callback);


View all the API methods at the [backbonedocs.drop.io](http://backbonedocs.drop.io/API-Methods).