/* global Ext */
/**
 * @version  1.0
 * ux.Media classes for the Flash JWPlayer 5.x 
 * @author Doug Hendricks. doug[always-At]theactivegroup.com
 * Copyright 2007-2010, Active Group, Inc.  All rights reserved.
 *
 ************************************************************************************
 *   This file is distributed on an AS IS BASIS WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 ************************************************************************************

 License: ux.Media.Flash and ux.Media.JWPlayer classes are licensed under the terms of
 the Open Source GPL 3.0 license (details: http://www.gnu.org/licenses/gpl.html).

 Commercial use is prohibited without a Commercial License. See http://licensing.theactivegroup.com.


 Donations are welcomed: http://donate.theactivegroup.com

 Notes: the <embed> tag or swfObject are NOT used(or necessary) in this implementation
*/

 (function(){
    
    Ext.ns('Ext.ux.Media.JWPlayer.dispatch');
    
    Ext.ux.Media.JWPlayer.Adapter = Ext.extend(Ext.ux.Media.Flash, {
        
        playerURL : '',
        
        playerCfg  : {}, //optional mixins applied to mediaCfg for player setup
        
        mediaCfg:{
            url        : null,
            autoSize   : true,
            volume     : 25,
            start      : false,
            loop       : false,
            scripting  : 'always',
            
            //ExternalInterface bindings
            boundExternals : [ 'sendEvent' ,
                               'addModelListener',
                               'addControllerListener',
                               'removeModelListener',
                               'removeControllerListener',
                               'addViewListener',
                               'removeViewListener',
                               'sendEvent',
                               'getConfig',
                               'getPlaylist'
                              ],
            params:{
                 wmode             :'opaque',
                 allowfullscreen   : true,
                 flashVars: {
                         autostart  :'@start',
                         file       :'http://content.bitsontherun.com/videos/6AJT5nbx.m4v',
                         stretching :'fill',
                         fullscreen : true,
                         shuffle    : false,
                         repeat     : false,
                         playerready : 'Ext.ux.Media.JWPlayer.playerReady',
                         volume     :'@volume' //(0-100)
                 }

             }
           },
           
       externalsNamespace : 'player',
       
       autoMask : true,  //set true here because this player provides feedback when ready
       
       autoScroll : false,
       
       initMedia : function(){
            
            this.addEvents(
               'playerready',
               'mute',
               'idle',
               'completed',
               'buffering',  //state change
               'playing',
               'paused',
               'loaded',
               'time',
               'error',
               'meta',
               'volume',
               'buffer'  //percentage
            );
            Ext.ux.Media.JWPlayer.Adapter.superclass.initMedia.apply(this,arguments);
       },
       
       clearMedia  : function(){
            var OE = Ext.ux.Media.JWPlayer.dispatch,
                OEN = 'Ext.ux.Media.JWPlayer.dispatch.',
                O;
                
             /**
              * Remove all listeners previously set by the class binding methods
              */   
            if(O = this.getInterface()){    
                Ext.each(
                  Ext.ux.Media.JWPlayer.controllerEvents,
                    function(eventName){
                        O.removeControllerListener(eventName, OEN + eventName);
                 },this);
                
                 Ext.each(
                  Ext.ux.Media.JWPlayer.modelEvents,
                    function(eventName){
                        var evn = eventName.toLowerCase(); 
                        O.removeModelListener(eventName, OEN + evn);
                 },this);
            }
            return Ext.ux.Media.JWPlayer.Adapter.superclass.clearMedia.apply(this, arguments);
       },
        
        /** @private called just prior to rendering the media
         * Merges playerCfg with default Player mediaCfg 
         */
       onBeforeMedia: function(){

          /* assemble a valid mediaCfg */
          var mc =  this.mediaCfg;
          var mp = mc.params||{};
          delete mc.params;
          var mv = mp[this.varsName]||{};
          delete mp[this.varsName];

          //playerCfg
          var pCfg = Ext.apply({},this.playerCfg || {});

           //player params
          var cp = Ext.apply({}, this.assert( pCfg.params,{}));
          delete pCfg.params;

           //player.params.flashVars
          var cv = Ext.apply({}, this.assert( cp[this.varsName],{}));
          delete cp[this.varsName];

          Ext.apply(mc , pCfg, {
              url  : this.assert(this.playerURL, null)
          });

          mc.params = Ext.apply(mp,cp);
          mc.params[this.varsName] = Ext.apply(mv,cv);

          Ext.ux.Media.JWPlayer.Adapter.superclass.onBeforeMedia.call(this);
           
      },
      
      /** @private  this function is designed to be used when a chart object notifies the browser
        * if its initialization state.  Raised Asynchronously.
        */
       onFlashInit  :  function(id){
           Ext.ux.Media.JWPlayer.Adapter.superclass.onFlashInit.apply(this,arguments);
           this.fireEvent.defer(1,this,['playerready',this, this.getInterface()]);
       },
       
       /**
        * Player API methods
        */
       play : function(){
           var p = this[this.externalsNamespace];        
           p && p.sendEvent && p.sendEvent("PLAY","true");
       },
       
       playlistItem : function(index){
           var p = this[this.externalsNamespace];        
           p && p.sendEvent && p.sendEvent("PLAYLISTITEM",index || 0);
       },
       
       playlistNext : function(){
           var p = this[this.externalsNamespace];        
           p && p.sendEvent && p.sendEvent("PLAYLISTNEXT");
       },
       
       playlistPrev : function(){
           var p = this[this.externalsNamespace];        
           p && p.sendEvent && p.sendEvent("PLAYLISTPREV");
       },
       stop : function(){
           var p = this[this.externalsNamespace];        
           p && p.sendEvent && p.sendEvent("STOP");
       },
       
       getConfig : function(){
           var p = this[this.externalsNamespace];        
           return p && p.getConfig ? p.getConfig() : null;
       },
       
       getPlaylist : function(){
           var p = this[this.externalsNamespace];        
           return p && p.getPlaylist ? p.getPlaylist() : null;
       },
       
       load  : function(uri){
           var p = this[this.externalsNamespace];        
           p && p.sendEvent && p.sendEvent("LOAD", uri);
       },
       
       mute : function(state){
           var p = this[this.externalsNamespace];        
           p && p.sendEvent && p.sendEvent("MUTE", state);
       },
       
       volume : function(perc){
           var p = this[this.externalsNamespace];        
           p && p.sendEvent && p.sendEvent("VOLUME", Math.max(parseInt(perc,10) || 0, 100));
       },
       
       seek  : function(pos){
           var p = this[this.externalsNamespace];        
           p && p.sendEvent && p.sendEvent("SEEK", parseInt(pos, 10) || 0);
       },
       
       fullscreen : function(state){
           var p = this[this.externalsNamespace];        
           p && p.sendEvent && p.sendEvent("FULLSCREEN", state);
       }

        
    });

    Ext.reg('jwp',
        Ext.ux.Media.JWPlayer.Component = Ext.extend(Ext.ux.Media.Flash.Component, {
            ctype : 'Ext.ux.Media.JWPlayer.Component' ,
            mediaClass  : Ext.ux.Media.JWPlayer.Adapter
         })
    );
    
    Ext.reg('jwpanel',
        Ext.ux.Media.JWPlayer.Panel = Ext.extend(Ext.ux.Media.Flash.Panel, {
            ctype : 'Ext.ux.Media.JWPlayer.Panel' ,
            mediaClass  : Ext.ux.Media.JWPlayer.Adapter
         })
    );
    
    Ext.reg('jwportlet',
        Ext.ux.Media.JWPlayer.Portlet = Ext.extend(Ext.ux.Media.Flash.Panel, {
            anchor      : '100%',
            frame       : true,
            collapseEl  : 'bwrap',
            collapsible : true,
            draggable   : true,
            cls         : 'x-portlet x-jwp-portlet',
            ctype       : 'Ext.ux.Media.JWPlayer.Panel' ,
            mediaClass  : Ext.ux.Media.JWPlayer.Adapter
         })
    );
    
    Ext.reg('jwwindow',
        Ext.ux.Media.JWPlayer.Window = Ext.extend(Ext.ux.Media.Flash.Window, {
            ctype : 'Ext.ux.Media.JWPlayer.Window' ,
            mediaClass  : Ext.ux.Media.JWPlayer.Adapter
         })
    );
    
    //JWPlayer sends notifications through a global 'playerReady' function handler.
    //This class method binds/dispatches common player events to each instance via Observables
    Ext.ux.Media.JWPlayer.playerReady =function(obj) {
        //Search for a ux.Flash-managed player.
        var mc, el = Ext.get(obj['id']);
        if(mc = (el?el.ownerCt:null)){
            var OE = Ext.ux.Media.JWPlayer.dispatch,
                OEN = 'Ext.ux.Media.JWPlayer.dispatch.',
                dispatch = function(eventName, ev){
                   var el = Ext.get(ev.id), 
                       component = el ? el.ownerCt : null;
                   component && component.fireEvent(eventName, component, ev);    
                };
                
            Ext.each(
              Ext.ux.Media.JWPlayer.controllerEvents,
                function(eventName){
                    OE[eventName] || (OE[eventName] = dispatch.createDelegate(this,[eventName],0));
                    mc.getInterface().addControllerListener(eventName, OEN + eventName);
             });
            
             Ext.each(
              Ext.ux.Media.JWPlayer.modelEvents,
                function(eventName){
                    var evn = eventName.toLowerCase(); 
                    OE[evn] || (OE[evn] = (function(eventName, state){
                        var ev = String(eventName == 'state' ? state.newstate : eventName).toLowerCase(); 
                        dispatch(ev, state);
                     }).createDelegate(this,[evn],0));
                
                  mc.getInterface().addModelListener(eventName, OEN + evn);
             });
             
             mc.onFlashInit();
            
        }
    };
    Ext.ux.Media.JWPlayer.controllerEvents = ['mute', 'item', 'play', 'playlist', 'resize', 'seek', 'stop', 'volume'];
    Ext.ux.Media.JWPlayer.modelEvents = ['STATE', 'BUFFER', 'TIME','LOADED', 'ERROR', 'META'];
    
 })();