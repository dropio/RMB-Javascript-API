/*
drop.io JavaScript API Client
http://backbonedocs.drop.io/Javascript-API-client-library

Copyright (c) 2010 drop.io
Licensed under the MIT license: 
http://www.opensource.org/licenses/mit-license.php
*/

DropioApiClient = (function(){
  
  var undefined,
    HOST = "http://drop.io/",
    API_HOST = "http://api.drop.io/",
    UPLOAD_HOST = "http://assets.drop.io/",
    DEFAULT_XR_SRC = "/DropioJSClientXDReceiver.html",
    
    DROPS_PATH = API_HOST + "drops",
    DROP_PATH = function(params){
      return DROPS_PATH + "/" + params.name;
    },
    ASSETS_PATH = function(params){
      return DROP_PATH(params) + "/assets";
    },
    ASSET_PATH = function(params){
      return ASSETS_PATH(params) + "/" + params.asset_name;
    },
    PINGBACKS_PATH = function(params){
      return DROP_PATH(params) + "/subscriptions";
    },
    PINGBACK_PATH = function(params){
      return PINGBACKS_PATH(params) + params.subscription_id;
    },
    
    GET = "get",
    POST = "post",
    PUT = "put",
    DELETE = "delete";
    
  // API instantiation function
  
  function api(key, path, options){
    options = options || {};
    this.api_key = key;
    this.xd_path = api.xd_path = path || this.xd_path;
    if (options.version)
      this.version = options.version;
    if (options === true)
      this.call_type = "ajax";
    else if (options.call_type)
      this.call_type = options.call_type;
  }
  
  api.prototype = {
    
    // API Defaults
    
    version   : "3.0",
    call_type : "iframe",
    xd_path   : "http://" + document.location.host + DEFAULT_XR_SRC,
    
    // API Access
    
    sendApiRequest : function(url, method, params, callback, keep_name) {
      params = cleanParams(params, this.api_key, this.version, keep_name);
      this.sendRequestByType[this.call_type](url, method, params, callback);
    },
    
    sendRequestByType : {
      ajax : function(url, method, params, callback){
        params.format = "json";
        this.getXHR(callback);
        this.request.open(method, url);
        this.request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        this.request.send(serializeParams(params));
      },

      iframe : function(url, method, params, callback){
        var form = forgeHiddenForm(url, method, params);
        document.body.appendChild(form);
        DropioApiClient.AIM.submit(form, callback, false);          
        document.body.removeChild(form);
      },

      yahoo_mail : function(url, method, params, callback){
    		if (typeof(openmail) === "undefined") {
    			alert("DropioApiClient cannot detect the Yahoo Mail environment.");
    			return false;
    		}
    		params["_method"] = method;
    		params["format"] = "json";
    		openmail.Application.callWebService({ url: url, method: POST,	parameters: params }, function(response){
    			var responseJSON = response.error ?
    			  failureResponse(response.error) :
    			  YAHOO.lang.JSON.parse(response.data);
    			callback(responseJSON, !response.error);
    		});
      }
    },
    
    // Public API Methods
    
    createDrop : function(params, callback){
      this.sendApiRequest(DROPS_PATH, POST, params, callback, true);
    },

    getDrop : function(params, callback){
      if (isValidDrop(params, callback))
        this.sendApiRequest(DROP_PATH(params), GET, params, callback);
    },

    updateDrop : function(params, callback){
      if (isValidDrop(params, callback))
        this.sendApiRequest(DROP_PATH(params), PUT, params, callback);
    },

    emptyDrop : function(params, callback){
      if (isValidDrop(params, callback))
        this.sendApiRequest(DROP_PATH(params) + "/empty", PUT, params, callback);
    },

    deleteDrop : function(params, callback){
      if (isValidDrop(params, callback))
        this.sendApiRequest(DROP_PATH(params), DELETE, params, callback);
    },

    createFile : function(){ 
      // Firefox only
    },

    createFileFromUrl : function(params, callback){
      if (isValidDrop(params, callback))
        this.sendApiRequest(ASSETS_PATH(params), POST, params, callback);
    },

    createLink : function(params, callback){
      if (isValidDrop(params, callback))
        this.sendApiRequest(ASSETS_PATH(params), POST, params, callback);
    },

    createNote : function(params, callback){
      if (isValidDrop(params, callback))
        this.sendApiRequest(ASSETS_PATH(params), POST, params, callback);
    },

    getAsset : function(params, callback){
      if (isValidDropAndAsset(params, callback))
        this.sendApiRequest(ASSET_PATH(params), GET, params, callback);
    },

    getAssetList : function(params, callback){
      if (isValidDrop(params, callback))
        this.sendApiRequest(ASSETS_PATH(params), GET, params, callback);
    },

    updateAsset : function(params, callback){
      if (isValidDropAndAsset(params, callback))
        this.sendApiRequest(ASSET_PATH(params), PUT, params, callback);
    },

    deleteAsset : function(params, callback){
      if (isValidDropAndAsset(params, callback))
        this.sendApiRequest(ASSET_PATH(params), DELETE, params, callback);
    },

    sendAsset : function(params, callback){
      if (isValidDropAndAsset(params, callback))
        this.sendApiRequest(ASSET_PATH(params) + "/send_to", POST, params, callback);
    },

    copyAsset : function(params, callback){
      if (isValidDropAndAsset(params, callback))
        this.sendApiRequest(ASSET_PATH(params) + "/copy", POST, params, callback);
    },

    moveAsset : function(params, callback){
      if (isValidDropAndAsset(params, callback))
        this.sendApiRequest(ASSET_PATH(params) + "/move", POST, params, callback);
    },

    createPingback : function(params, callback){
      if (isValidDrop(params, callback)) {
        params.type = "pingback";
        this.sendApiRequest(PINGBACKS_PATH(params), POST, params, callback);
      }
    },

    getPingback : function(params, callback){
      if (isValidDropAndSubscription(params, callback))
        this.sendApiRequest(PINGBACK_PATH(params), GET, params, callback);
    },

    deletePingback : function(params, callback){
      if (isValidDropAndSubscription(params, callback))
        this.sendApiRequest(PINGBACK_PATH(params), DELETE, params, callback);
    },

    getPingbackList : function(params, callback){
      if (isValidDropAndSubscription(params, callback))
        this.sendApiRequest(PINGBACKS_PATH(params), GET, params, callback);
    },

    getManagerDrops : function(params, callback){
      this.sendApiRequest(API_HOST + "accounts/drops", GET, params, callback);
    },

    getManagerStats : function(){
      this.sendApiRequest(API_HOST + "accounts/stats", GET, params, callback);
    },
    
    createUploader : function(params, callback, options){
      if (!params)
        return false;
      options = options || {};
      params = cleanParams(params, this.api_key, this.version);
      params.format = "html";
      params.version = this.version;
      params.token = params.token || "";
      var target,
        drop = params.name,
        div = forge("div"),
        form = forge("form", {
          action : UPLOAD_HOST + "/upload",
          method : POST,
          enctype : "multipart/form-data",
          encoding : "multipart/form-data", // for IE
          className : options.form_css || "",
          id : options.form_id || "dropio_js_api_upload_form" + randomNumber()
        });
      
      for (var key in params)
        form.appendChild(forge("input", { type : "hidden", name : key, value : params[key] }));
      
      if (options.show_label === null || options.show_label === true) {
        var label = forge("label", {
          className : options.label_css || "",
          id : options.label_id || ""
        }, options.label || "File :");
        form.appendChild(label);
      }
      
      var file_input = forge("input", {
        type : "file",
        name : "file",
        id : "file",
        className : options.file_input_css || ""
      });
      form.appendChild(file_input);
      
      if (options.show_submit_button === null || options.show_submit_button === true) {
        var submit = forge("input", {
          type : "submit",
          value : options.submit_button_label || "Upload",
          className : options.submit_button_css || "",
          id : options.submit_button_id || "",
          onclick : function(){
            DropioApiClient.AIM.submitUploadForm(form.id, callback);
          }
        });
        form.appendChild(submit);
      }
      
      if (options.insert_after) {
        target = document.getElementById(options.insert_after);
        target.parentNode.appendChild(div, target);
      } else if (options.insert_before) {
        target = document.getElementById(options.insert_before);
        target.parentNode.insertBefore(div, target);
      } else if (options.append_to) {
        document.getElementById(options.append_to).appendChild(div);
      }
      
      div.appendChild(form);
      return div;
      
    },
    
    getXHR : function(callback){
      var ua = navigator.userAgent.toLowerCase();
      this.abortRequest();
      if (!window.ActiveXObject)
        this.request = new XMLHttpRequest();
      else if (ua.indexOf("msie 5") === -1)
        this.request = new ActiveXObject("Msxml2.XMLHTTP");
      else
        this.request = new ActiveXObject("Microsoft.XMLHTTP");
      this.request.onreadystatechange = function(){
        if (this.readyState === 4) {
          if (this.status === 0)
            return;
          var responseJSON = parseJSON(this.responseText);
          callback(responseJSON, this.status === 200);
        }
      };
    },
    
    abortRequest : function(){
      if (this.request)
        this.request.abort();
      this.request = null;
    }

  };
  
  // AIM Interface
  
  api.AIM = {
    
    call_in_progress : false,
    watchers : [],
    responseJSON : "",
    
    addWatcherIframe : function(name, upload) {
      var watcher_host = upload ? UPLOAD_HOST : (API_HOST + "javascripts/"),
        watcher_id = name + "_watcher_" + randomNumber();
        iframe = forge("iframe", {
          style : {
            width : "0px",
            height : "0px",
            border : "0px"
          },
          src : watcher_host + "js_api_watcher.html#" + api.xd_path + "&" + name + "&0",
          "name" : name + "_watcher",
          id : watcher_id
        });
      DropioApiClient.AIM.watchers.push(watcher_id);
      document.body.appendChild(iframe);
    },
    
    submit : function(form, callback, upload){
      if (DropioApiClient.AIM.call_in_progress)
        return false;
      DropioApiClient.AIM.call_in_progress = true;
      var unique_name = "dropio_js_client_xd_receiver_" + randomNumber(),
        div  = forge("div"),
        iframe = forge("iframe", {
          style : {
            width : "0px",
            height : "0px",
            border : "0px"
          },
          src : "about:blank",
          name : unique_name,
          id : unique_name,
          onload : "DropioApiClient.AIM.addWatcherIframe(\"" + unique_name + "\"," + upload + ");"
        });
      div.appendChild(iframe);
      document.body.appendChild(div);
      var target = document.getElementById(unique_name);
      target.onComplete = callback;
      form.target = unique_name;
      form.submit();
    },
    
    submitUploadForm : function(id) {
      var form = document.getElementById(id);
      DropioApiClient.AIM.submit(form, form.onsubmit, true);
    },
    
    parseResult : function(id, json, more) {
      DropioApiClient.AIM.responseJSON += json;
      if (more)
        return;
      
      json = DropioApiClient.AIM.responseJSON;
      var trim = [json.indexOf("{"), json.lastIndexOf("}"), json.indexOf("["), json.lastIndexOf("]")].sort(function(x, y){
          return x < y ? -1 : 1;
        });
      json = json.substring(trim[0], trim[3] + 1);
      json = parseJSON(json);
      
      var iframe = document.getElementById(id);
      if (iframe)
        iframe.onComplete(json, json.response !== "Failure");
      
      DropioApiClient.AIM.responseJSON = "";
      DropioApiClient.AIM.call_in_progress = false;
      DropioApiClient.AIM.cleanup(id,
        (navigator.userAgent.indexOf("WebKit") > -1 ? [] : DropioApiClient.AIM.watchers));
      DropioApiClient.AIM.watchers = [];

    },
    
    cleanup : function(name, watchers) {
      removeElement(name);
      var watcher;
      while (watcher = watchers.pop())
        removeElement(watcher);
    }
    
  };
  
  api.updateDropNameForUploadForm = function(id, name){
    document.getElementById(id).drop_name.value = name;
  };
  
  api.updateTokenForUploadForm = function(id, token){
    document.getElementById(id).token.value = token;
  };
  
  api.updateCallbackForUploadForm = function(id, callback){
    document.getElementById(id).onsubmit = callback;
  };
  
  api.submitUploadForm = function(id){
    var f = document.getElementById(id);
    api.AIM.submit(f, f.onsubmit, true);
  };
  
  // Internal functions
  
  function forge(tag, attributes, content) {
    var element = document.createElement(tag);
    for (var key in attributes)
      if (key === "style")
        for (var rule in attributes[key])
          element.style[rule] = attributes[key][rule];
      else
        element.setAttribute(key, attributes[key]);
    if (content)
      element.innerHTML = content;
    return element;
  }
  
  function removeElement(id) {
    var node = document.getElementById(id), parent = node.parentNode;
    parent.removeChild(node);
  }
  
  function failureResponse(error) {
    return { result : "Failure", action : "DropioApiClient", message: error };
  }
  
  function isValid(name, callback) {
    var valid = name && name !== "";
    if (!valid)
      callback(failureResponse("Missing required parameter"));
    return valid;
  }
  
  function isValidDrop(params, callback) {
    return isValid(params.name, callback);
  }
  
  function isValidDropAndAsset(params, callback) {
    return (isValid(params.name, callback) && isValid(params.asset_name, callback));
  }
  
  function isValidDropAndSubscription(params, callback) {
    return (isValid(params.name, callback) && isValid(params.subscription_id, callback));
  }
  
  function cleanParams(params, key, version, keep_name) {
    var newparams = {
      api_key : key,
      version : version
    };
    for (var key in params)
      if (typeof params[key] === "boolean" || (params[key] !== null && params[key] !== ""))
        newparams[key] = params[key];
    if (params["to_drop_name"])
      newparams.name = params.to_drop_name;
    if (!keep_name)
      delete newparams.name;
    return newparams;
  }
  
  function serializeParams(params) {
    var chunks = [];
    for (var key in params)
      chunks.push(key + "=" + escape[params[key]]);
    return chunks.join("&");
  }
  
  function randomNumber(){
    return ((Math.round(Math.random()*9999999)));
  }
  
  function parseJSON(json){
    try {
      json = eval("("+ json +")");
    } catch(e) {
      json = { response : failureResponse("Unexpected response from the server") };
    }
    return json;
  }
  
  function SHA1(msg) {

    function rotate_left(n,s) {
      return (n << s) | (n >>> (32 - s));
    };

    function cvt_hex(val) {
      var str = "", i, v;
      for (i = 7; i >= 0; i--) {
        v = (val >>> (i * 4)) & 0x0f;
        str += v.toString(16);
      }
      return str;
    }

    function Utf8Encode(string) {
      string = string.replace(/\r\n/g,"\n");
      var utftext = "", n, c;
      for (n = 0; n < string.length; n++) {
        c = string.charCodeAt(n);
        if (c < 128) {
          utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
          utftext += String.fromCharCode((c >> 6) | 192);
          utftext += String.fromCharCode((c & 63) | 128);
        } else {
          utftext += String.fromCharCode((c >> 12) | 224);
          utftext += String.fromCharCode(((c >> 6) & 63) | 128);
          utftext += String.fromCharCode((c & 63) | 128);
        }
      }
      return utftext;
    }

    var blockstart, i , j, A, B, C, D, E, temp,
      W = new Array(80),
      word_array = [],
      H0 = 0x67452301;
      H1 = 0xEFCDAB89;
      H2 = 0x98BADCFE;
      H3 = 0x10325476;
      H4 = 0xC3D2E1F0;

    msg = Utf8Encode(msg);
    var msg_len = msg.length;

    for (i = 0; i < msg_len - 3; i += 4) {
      j = msg.charCodeAt(i) << 24 |
        msg.charCodeAt(i + 1) << 16 |
        msg.charCodeAt(i + 2) << 8 |
        msg.charCodeAt(i + 3);
      word_array.push(j);
    }

    switch (msg_len % 4) {
      case 0:
        i = 0x080000000;
        break;
      case 1:
        i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
        break;
      case 2:
        i = msg.charCodeAt(msg_len - 2) << 24 |
          msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
        break;
      case 3:
        i = msg.charCodeAt(msg_len - 3) << 24 |
          msg.charCodeAt(msg_len - 2) << 16 |
          msg.charCodeAt(msg_len - 1) << 8 | 0x80;
        break;
    }

    word_array.push(i);

    while ((word_array.length % 16) !== 14)
      word_array.push(0);

    word_array.push(msg_len >>> 29);
    word_array.push((msg_len << 3) & 0x0ffffffff);

    for (blockstart = 0; blockstart < word_array.length; blockstart += 16) {

      for (i = 0; i < 16; i++)
        W[i] = word_array[blockstart + i];

      for (i = 16; i <= 79; i++)
        W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);

      A = H0;
      B = H1;
      C = H2;
      D = H3;
      E = H4;

      for (i = 0; i <= 19; i++) {
        temp = (rotate_left(A, 5) + ((B & C) | (~ B & D)) +E + W[i] + 0x5A827999) & 0x0ffffffff;
        E = D;
        D = C;
        C = rotate_left(B, 30);
        B = A;
        A = temp;      
      }

      for (i = 20; i <= 39; i++) {
        temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
        E = D;
        D = C;
        C = rotate_left(B, 30);
        B = A;
        A = temp;
      }

      for (i = 40; i <= 59; i++) {
        temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
        E = D;
        D = C;
        C = rotate_left(B, 30);
        B = A;
        A = temp;
      }

      for (i = 60; i <= 79; i++) {
        temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
        E = D;
        D = C;
        C = rotate_left(B, 30);
        B = A;
        A = temp;
      }

      H0 = (H0 + A) & 0x0ffffffff;
      H1 = (H1 + B) & 0x0ffffffff;
      H2 = (H2 + C) & 0x0ffffffff;
      H3 = (H3 + D) & 0x0ffffffff;
      H4 = (H4 + E) & 0x0ffffffff;

    }

    temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);

    return temp.toLowerCase();
  }
  
  function forgeHiddenForm(url, method, params){
    var form = forge("form",
      { action : url,
        method : "post",
        id : "dropio_api_call_form_" + randomNumber(),
        style : { display : "none" }
      });
    for (var key in params) {
      form.appendChild(forge("input", { type : "hidden", name : key, value : params[key] }));
    }
    form.appendChild(forge("input", { type : "hidden", name : "_method", value : method }));
    form.appendChild(forge("input", { type : "hidden", name : "format", value : "jtext" }));
    return form;
  }
    
  // Fin. Return api as window.DropioApiClient.
  
  return api;

})();