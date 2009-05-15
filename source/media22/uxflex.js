/* global Ext */
/* ux.Media.Flex
 * version  1.0 RC1
 * @author Doug Hendricks. doug[always-At]theactivegroup.com
 * @copyright 2007-2009, Active Group, Inc.  All rights reserved.
 *
 ************************************************************************************
 *   This file is distributed on an AS IS BASIS WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 ************************************************************************************

 License: ux.Media.Flex class is licensed under the terms of
 the Open Source GPL 3.0 license (details: http://www.gnu.org/licenses/gpl.html).

 Commercial use is prohibited without a Commercial License. See http://licensing.theactivegroup.com.

 Donations are welcomed: http://donate.theactivegroup.com

 Notes: the <embed> tag is NOT used(or necessary) in this implementation

 Version:
        1.0 RC1
        
 Ext Component Implementation of the FAbridge (Flex/ActionScript -> Javascript bridge)
 FABridge.js is NOT required.
          
    mediaCfg: {Object}
         {
           url       : Url resource to load when rendered
          ,loop      : (true/false)
          ,start     : (true/false)
          ,height    : (defaults 100%)
          ,width     : (defaults 100%)
          ,scripting : (true/false) (@macro enabled)
          ,controls  : optional: show plugins control menu (true/false)
          ,eventSynch: (Bool) If true, this class initializes an internal event Handler for
                       ActionScript event synchronization
          ,listeners  : {"mouseover": function() {}, .... } DOM listeners to set on the media object each time the Media is rendered.
          ,requiredVersion: (String,Array,Number) If specified, used in version detection.
          ,unsupportedText: (String,DomHelper cfg) Text to render if plugin is not installed/available.
          ,installUrl:(string) Url to inline SWFInstaller, if specified activates inline Express Install.
          ,installRedirect : (string) optional post install redirect
          ,installDescriptor: (Object) optional Install descriptor config
         }
    */

(function(){

   var ux = Ext.ux.Media;
    /**
     *
     * @class Ext.ux.Media.Flex
     * @extends Ext.ux.Media.Flash
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
     * @constructor
     * @version 1.0 RC1
     * @desc
     * Media Class for Flex objects. Used for rendering Flash Objects for use with inline markup.
     */

    Ext.ux.Media.Flex = Ext.extend( Ext.ux.Media.Flash , {
       
        /** @private
         *  (called once by the constructor)
         */
        initMedia : function(){

            ux.Flex.superclass.initMedia.call(this);
            this.addEvents(
            /**
              * Fires when the FlexActionscript Bridge reports an initialized state via a public callback function.
              * @event flexinit
              * @memberOf Ext.ux.Media.Flex
              * @param {Ext.ux.Media.Flex} this Ext.ux.Media.Flex instance
              */
            'flexinit'
            );
        },

        /** @private */
        getMediaType: function(){
             var mt = Ext.apply({},{
                 cls      : 'x-media x-media-flex'
             }, this.mediaType);
             
             mt.params[this.varsName] || (mt.params[this.varsName]={});
             Ext.apply(mt.params[this.varsName],{
                bridgeName: '@id'   //default to the ID of the SWF object.
             });
             return mt;
        },

        /*
         * @return {Object} Flex Root
         */
        getBridge : function(){
            return this.mediaObject ? this.mediaObject.getRoot() : null; 
        },
        setVariable : Ext.emptyFn,
        getVariable : Ext.emptyFn,
        bindExternals : Ext.emptyFn,
        
        /** @private */
        onFlexInit : function(){
           var M;
           if(M = this.mediaObject){
	            M.bridgeID = ux.Flex.nextBridgeID++;
	            ux.Flex.idMap[M.bridgeID] = M;
                if(this.mediaMask && this.autoMask){this.mediaMask.hide();}
                this.fireEvent.defer(300,this,['flexinit',this]);
           }
        },
        
        /**
         * @private
         * Dispatches events received from the SWF object (when defined by the eventSynch mediaConfig option).
         *
         * @method _handleSWFEvent
         * @private
         */
        _handleSWFEvent: function(event)
        {
            var type = event.type||event||false;
            if(type){
                 if(this.events && !this.events[String(type)])
                     { this.addEvents(String(type));}

                 return this.fireEvent.apply(this, [String(type), this].concat(Array.prototype.slice.call(arguments,0)));
            }
        },
        /** Remove (safely) an existing mediaObject from the Component.
         *
         */
        clearMedia  : function(){

           //release Flex bindings
           var M;
           if(M = this.mediaObject){
              M.releaseASObjects();
              M.bridgeID && (delete ux.Flex.idMap[M.bridgeID]);
           }
           ux.Flex.superclass.clearMedia.call(this);
        }
    });
        
    /** 
     * Class members 
     * @memberOf Ext.ux.Media.Flex
     */
    Ext.apply(ux.Flex, {
	    onFlexBridge : function(bridgeId){
	        var c, d = Ext.get(bridgeId[0]);
	        if(d && (c = d.ownerCt)){
	            c.onFlexInit && c.onFlexInit.defer(1, c);
	            c = d = null;
	            return false;
	        }
            
	        d= null;
           
	    },
        
        extractBridgeFromID : function(id) {
            return ux.Flex.idMap[(id >> 16)];
		},
         /** 
         * @memberOf Ext.ux.Media.Flex
         * @static
         */ 
	    TYPE_ASINSTANCE : 1,
        /** 
         * @memberOf Ext.ux.Media.Flex
         * @static
         */ 

        TYPE_ASFUNCTION : 2,
        /** 
         * @memberOf Ext.ux.Media.Flex
         * @static
         */
	    TYPE_JSFUNCTION : 3,
        /** 
         * @memberOf Ext.ux.Media.Flex
         * @static
         */
	    TYPE_ANONYMOUS  : 4,
        
        nextBridgeID : 0,
        idMap        : {},
        argsToArray : function(args) {
		    var result = [];
		    for(var i=0;i<args.length;i++) {
		        result[i] = args[i];
		    }
		    return result;
		},
        blockedMethods : {
		    toString: true,
		    get: true,
		    set: true,
		    call: true
		}
    });
    
    window.FABridge__bridgeInitialized = Ext.type(window.FABridge__bridgeInitialized) == 'function' ? 
        window.FABridge__bridgeInitialized.createInterceptor(ux.Flex.onFlexBridge):
            ux.Flex.onFlexBridge;
            
    window.FABridge__invokeJSFunction = function(args){
		    var funcID = args[0];
		    var callArgs = args.concat();
		    callArgs.shift();
		    var bridge = ux.Flex.extractBridgeFromID(funcID);
		    return bridge ? bridge.invokeLocalFunction(funcID,callArgs) : undefined;
		};

     /**
      *
      * @class Ext.ux.Media.Flex.Component
      * @extends Ext.ux.Media.Flash.Component
      * @base Ext.ux.Media.Flex
      * @version 1.0 RC1
      * @author Doug Hendricks. doug[always-At]theactivegroup.com
      * @copyright 2007-2009, Active Group, Inc.  All rights reserved.
      * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
      * @license <a href="http://www.gnu.org/licenses/gpl.html">GPL 3.0</a>
      * @constructor
      * @param {Object} config The config object
      * @desc
      * Base Media Class for Flex objects
      * Used primarily for rendering Flash Objects for use with inline markup.
    */
   Ext.ux.Media.Flex.Component = Ext.extend(Ext.ux.Media.Flash.Component, {
         /**
         * @private
         */
         ctype         : "Ext.ux.Media.Flex.Component",

        /**
         * @private
         */
         cls    : "x-media-flex-comp",

        /**
         * @private
         * The className of the Media interface to inherit
         */
         mediaClass    : Ext.ux.Media.Flex
        
   });

   Ext.reg('uxflex', Ext.ux.Media.Flex.Component);

   /**
     *
     * @class Ext.ux.Media.Flex.Panel
     * @extends Ext.ux.Media.Flash.Panel
     * @version 1.0 RC1
     * @author Doug Hendricks. doug[always-At]theactivegroup.com
     * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
     * @copyright 2007-2009, Active Group, Inc.  All rights reserved.
     * @constructor
     * @base Ext.ux.Media.Flex
     * @param {Object} config The config object
     * @desc
     * Base Media Class for Flash objects
     * Used primarily for rendering Flash Objects for use with inline markup.
    */

   Ext.ux.Media.Flex.Panel = Ext.extend(Ext.ux.Media.Flash.Panel,{

        ctype         : "Ext.ux.Media.Flex.Panel",
        /**
         * @private
         */
        cls           : "x-media-flex-panel",
        mediaClass    : Ext.ux.Media.Flex

   });

   Ext.reg('flexpanel', ux.Flex.Panel);
   Ext.reg('uxflashpanel', ux.Flex.Panel);

   /**
    *
    * @class Ext.ux.Media.Flex.Portlet
    * @extends Ext.ux.Media.Flash.Portlet
    * @version  1.0 RC1
    * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
    * @author Doug Hendricks. doug[always-At]theactivegroup.com
    * @copyright 2007-2009, Active Group, Inc.  All rights reserved.
    * @desc
    * Base Media Class for Flex objects
    * Used primarily for rendering Flash Objects for use with inline markup.
    */

   Ext.ux.Media.Flex.Portlet = Ext.extend(Ext.ux.Media.Flash.Portlet,{
       ctype        : "Ext.ux.Media.Flash.Portlet",
       cls          : 'x-portlet x-media-flex-portlet',
       mediaClass    : Ext.ux.Media.Flex
       
   });

   Ext.reg('flexportlet', ux.Flex.Portlet);
   Ext.reg('uxflexportlet', ux.Flex.Portlet);

   /**
    *
    * @class Ext.ux.Media.Flex.Window
    * @extends Ext.ux.Media.Flash.Window
    * @version  1.0
    * @author Doug Hendricks. doug[always-At]theactivegroup.com
    * @donate <a target="tag_donate" href="http://donate.theactivegroup.com"><img border="0" src="http://www.paypal.com/en_US/i/btn/x-click-butcc-donate.gif" border="0" alt="Make a donation to support ongoing development"></a>
    * @copyright 2007-2009, Active Group, Inc.  All rights reserved.
    * @constructor
    * @base Ext.ux.Media.Flex
    * @param {Object} config The config object
    * @desc
    * Base Media Class for Flex objects
    * Used primarily for rendering Flash Objects for use with inline markup.
    */

   Ext.ux.Media.Flex.Window  = Ext.extend( Ext.ux.Media.Flash.Window , {

        ctype         : 'Ext.ux.Media.Flex.Window',
        cls           : 'x-media-flex-window',
        mediaClass    : Ext.ux.Media.Flex

   });

   Ext.reg('flexwindow', ux.Flex.Window);
   
   /*
    * FABridge Bindings are maintained on the Flex.Element
    */
   Ext.ux.Media.Flex.Element = Ext.extend ( Ext.ux.Media.Flash.Element , {
       
        remoteTypeCache : {},
        remoteInstanceCache : {},
        remoteFunctionCache : {},
        localFunctionCache : {},
        nextLocalFuncID : 0,    
        getRoot : function(){
            return this.dom.getRoot ? this.deserialize(this.dom.getRoot()): undefined;
        },
        releaseASObjects: function(){
	        return this.dom.releaseASObjects ? this.dom.releaseASObjects() : null;  
	    },
	    createObject: function(className){
	        return this.dom.create ? this.deserialize(this.dom.create(className)): null;
	    },
        /*------------------------------------------------------------------------------------
		// low level access to the flash object
		/*----------------------------------------------------------------------------------*/
	
	    getPropertyFromAS: function(objRef,propName) 
	    {
	        return this.dom.getPropFromAS(objRef,propName);
	    },  
	
	    setPropertyInAS: function(objRef,propName,value){
	        return this.dom.setPropInAS(objRef,propName,this.serialize(value));
	    },
	        
	    callASFunction: function(funcID, args){
	        return this.dom.invokeASFunction(funcID,this.serialize(args));   
	    },
	
	    callASMethod: function(objID, funcName, args){
	        return this.dom.invokeASMethod(objID,funcName, this.serialize(args));    
	    },
        makeID: function(token){
            return (this.bridgeID << 16) + token;
        },
	
	/*------------------------------------------------------------------------------------
	// responders to remote calls from flash
	/*----------------------------------------------------------------------------------*/
	
	    invokeLocalFunction: function(funcID,args){
	        var result;
	        var func = this.localFunctionCache[funcID];
	        if(func != undefined) {
	            result = this.serialize(func.apply(null,this.deserialize(args)));
	        }
	        return result;
	    },
	
		/*------------------------------------------------------------------------------------
		// Object Types and Proxies
		/*----------------------------------------------------------------------------------*/
		
		// accepts an object reference, returns a type object matching the obj reference.
	    getTypeFromName: function(objTypeName){
	        return this.remoteTypeCache[objTypeName];
	    },
	
	    createProxy: function(objID,typeName){
	        var objType = this.getTypeFromName(typeName);
            instanceFactory.prototype = objType;
            return this.remoteInstanceCache[objID] = new instanceFactory(objID);

	    },
	
	    getProxy: function(objID) {
	        return this.remoteInstanceCache[objID];
	    },
	
	    // accepts a type structure, returns a constructed type
	    addTypeDataToCache: function(typeData){
	        var newType = new ASProxy(this,typeData.name);
	
	        var accessors = typeData.accessors,
              i, L = accessors.length;
	        for(i=0;i<L;i++) {
	            this.addPropertyToType(newType,accessors[i]);
	        }
	    
	        var methods = typeData.methods;
            L = methods.length;
	        for(i=0;i<L;i++) {
	            ux.Flex.blockedMethods[methods[i]] || 
	                this.addMethodToType(newType,methods[i]);
	        }
	        this.remoteTypeCache[newType.typeName] = newType;
	        return newType;
	    },
	
	    addPropertyToType: function(ty,propName) 
	    {
	        ty[propName] = function() {
	            return this.bridge.deserialize(this.bridge.getPropertyFromAS(this.id,propName));
	        }
	        var c = propName.charAt(0);
	        var setterName;
	        if(c >= "a" && c <= "z")
	        {
	            setterName = "set" + c.toUpperCase() + propName.substr(1);
	        }
	        else
	        {
	            setterName = "set" + propName;
	        }
	        ty[setterName] = function(val) {
	            this.bridge.setPropertyInAS(this.id,propName,val);
	        }
	    },
	
	    addMethodToType: function(ty,methodName){
	        ty[methodName] = function() { 
	            return this.bridge.deserialize(this.bridge.callASMethod(this.id,methodName,ux.Flex.argsToArray(arguments)));
	        }
	    },
	
		/*------------------------------------------------------------------------------------
		// Function Proxies
		/*----------------------------------------------------------------------------------*/
		
	    getFunctionProxy: function(funcID) 
	    {
	        var bridge = this;
	        if(this.remoteFunctionCache[funcID] == null) {
	            this.remoteFunctionCache[funcID] = function() {
	                bridge.callASFunction(funcID,ux.Flex.argsToArray(arguments));
	            }
	        }
	        return this.remoteFunctionCache[funcID];
	    },
	
	    getFunctionID: function(func)
	    {
	        if(func.__bridge_id__ == undefined) {
	            func.__bridge_id__ = this.makeID(this.nextLocalFuncID++);
	            this.localFunctionCache[func.__bridge_id__] = func;     
	        }
	        return func.__bridge_id__;
	    },
	
		/*------------------------------------------------------------------------------------
		// serialization / deserialization
		/*----------------------------------------------------------------------------------*/
	
	    serialize: function(value) 
	    {
	        var result = {};
	        var t = typeof(value);
	        if(t == "number" || t == "string" || t == "boolean" || t == null || t == undefined) {
	            result = value;
	        }
	        else if(Ext.isArray(value)){
	            result = [];
                var L = value.length;
	            for(var i=0;i<L;i++) {
	                result[i] = this.serialize(value[i]);
	            }
	        }
	        else if(t == "function") 
	        {
	            result.type = ux.Flex.TYPE_JSFUNCTION;
	            result.value = this.getFunctionID(value,true);              
	        }
	        else if (value instanceof ASProxy)
	        {
	            result.type = ux.Flex.TYPE_ASINSTANCE;
	            result.value = value.id;
	        } 
	        else 
	        {
	            result.type = ux.Flex.TYPE_ANONYMOUS;
	            result.value = value;
	        }
	    
	        return result;
	    },
	
	    deserialize: function(packedValue) 
	    {
	    
	        var result, L;
	    
	        var t = typeof(packedValue);
	        if(t == "number" || t == "string" || t == "boolean" || packedValue == null || packedValue == undefined) 
	        {
	            result = packedValue;
	        }
	        else if (Ext.isArray(packedValue)){
	            result = [];
                L = packedValue.length;
	            for(var i=0;i<L;i++) 
	            {
	                result[i] = this.deserialize(packedValue[i]);
	            }
	        }
	        else if (t == "object")
	        {
                L = packedValue.newTypes.length;
	            for(var i=0;i<L;i++) {
	                this.addTypeDataToCache(packedValue.newTypes[i]);
	            }
	            for(var aRefID in packedValue.newRefs) {
	                this.createProxy(aRefID,packedValue.newRefs[aRefID]);
	            }
	            if (packedValue.type == ux.Flex.TYPE_PRIMITIVE) 
	            {
	                result = packedValue.value;
	            }
	            else if (packedValue.type == ux.Flex.TYPE_ASFUNCTION) 
	            {       
	                result = this.getFunctionProxy(packedValue.value);              
	            } 
	            else if (packedValue.type == ux.Flex.TYPE_ASINSTANCE) 
	            {           
	                result = this.getProxy(packedValue.value);
	            }
	            else if (packedValue.type == ux.Flex.TYPE_ANONYMOUS)
	            {
	                result = packedValue.value;
	            }
	        }
	        return result;
	      }

    });
   
    /*------------------------------------------------------------------------------------
    * Factory
    * @private
    * @static
    /*----------------------------------------------------------------------------------*/
    
    function instanceFactory(objID) {
	    this.id = objID;
	    return this;
	}

   /*------------------------------------------------------------------------------------
	* ActionScript proxy facade
    * @private
    * @static
	/*----------------------------------------------------------------------------------*/
	
	var ASProxy = function(bridge,typeName) {
	    this.bridge = bridge;
	    this.typeName = typeName;
	    return this;
	};
	
	Ext.override(ASProxy ,{ 
	    get: function(propName){
	        return this.bridge.deserialize(this.bridge.getPropertyFromAS(this.id,propName));    
	    },
	    set: function(propName,value){
	        this.bridge.setPropertyInAS(this.id,propName,value);
	    },
        call: function(funcName,args){
	        this.bridge.callASMethod(this.id,funcName,args);
	    }
	});
   
     ux.Flex.prototype.elementClass  =  Ext.ux.Media.Flex.Element;
            
	 Ext.ux.FlexComponent  = Ext.ux.Media.Flex.Component;
	 Ext.ux.FlexPanel      = Ext.ux.Media.Flex.Panel;
	 Ext.ux.FlexPortlet    = Ext.ux.Media.Flex.Portlet;
	 Ext.ux.FlexWindow     = Ext.ux.Media.Flex.Window;

})();

