/* global Ext */
/**
 * @class Ext.ux.Chart.OFC
 * @version 1.1
 * Author: Doug Hendricks. doug[always-At]theactivegroup.com
 * Copyright 2007-2008, Active Group, Inc.  All rights reserved.
 */
 /************************************************************************************
 *   This file is distributed on an AS IS BASIS WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 ************************************************************************************

 License: ux.Chart.OFC is licensed under the terms of the Open Source GPL 3.0 license.

     This program is free software for non-commercial use: 
     you can redistribute it and/or modify
     it under the terms of the GNU General Public License as published by
     the Free Software Foundation, either version 3 of the License, or
     any later version.

     This program is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU General Public License for more details.

     You should have received a copy of the GNU General Public License
     along with this program.  If not, see < http://www.gnu.org/licenses/gpl.html>.

   Donations are welcomed: http://donate.theactivegroup.com
   Commercial use is prohibited without a Commercial License. See http://licensing.theactivegroup.com.

 Version:  1.1  10/14/2008 
         Add: saveAsImage method since latest OFC2 beta now supports it.
         Add: imagesaved Event.
         Fixes: Corrected ofcCfg options merge for params and flashVars

 Component Config Options:

   chartUrl    : the URL to open_flash_chart.swf
   dataUrl     : the URL of a remote chart data resource (loaded by the chart object itself)
   autoLoad    : Use Ext.Ajax to remote load a JSON chart series
   chartData   : (optional object/JSON string) series to load when rendered
   ofcCfg  : {  //optional
            id    : String   id of <object> tag
            style : Obj  optional DomHelper style object

        }

 This class inherits from (thus requires) the ux.Media(uxmedia.js) and
 ux.Media.Flash (uxflash.js) classes.

 */


(function(){
    Ext.namespace("Ext.ux.Chart");

    var chart = Ext.ux.Chart;
    var Media = Ext.ux.Media;

    var ofcAdapter = Ext.extend( Media.Flash , {

       /**
        * @cfg {String|Float} requiredVersion The required Flash version necessary to support the Chart object.
        * @default "9"
        */
       requiredVersion : 9,

       /**
        * @cfg {Mixed} unsupportedText Text Markup/DOMHelper config displayed when the Flash Plugin is not available.
        */
       unsupportedText : {cn:['The Adobe Flash Player{0}is required.',{tag:'br'},{tag:'a',cn:[{tag:'img',src:'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif'}],href:'http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash',target:'_flash'}]},

       /**
        * @cfg {String} chartURL Url of the Open Flash Chart object.
        */
       chartURL        : null,

       /**
        * @cfg {String} dataURL Url of the JSON data to load.
        */
       dataURL         : null,

       /**
        * @cfg {String} chartData Raw JSON to autoLoad.  This value takes precedence over autoLoad URL.
        */
       chartData       : null,

       /**
        * @cfg {String} autoLoad
        */
       autoLoad        : null,

       /**
        * @cfg {String} autoScroll
        * @default "false"
        */
       autoScroll      : false,

       /** @private */
       mediaCfg        : {url      : null,
                          id       : null,
                          start    : true,
                          controls : true,
                          name    :'@id',
                          height  : '@height',
                          width   : '@width',
                          autoSize : false,
                          renderOnResize:false,
                          scripting : 'always',
                          cls     :'x-media x-media-swf x-chart-ofc',
                          params  : {
                             allowscriptaccess : '@scripting',
                             swliveconnect : true,
                             wmode     :'transparent',
                             scale     :'exactfit',
                             salign      : 't'
                            }
        },

        /** @private */
       initMedia  : function(){

           ofcAdapter.superclass.initMedia.call(this);

           this.addEvents(

              /**
               * @event chartload
               * Fires when the underlying chart component reports an initialized state
               * @param {Ext.ux.Chart.OFC} this
               * @param {object} the underlying chart component DOM reference
               */

              'chartload',

             /**
              * @event chartrender
              * Fires when the underlying chart component has rendered its chart series data.
              * @param {Ext.ux.Chart.OFC} this
              * @param {object} the underlying chart component DOM reference
              */
              'chartrender',
              
              /**
              * @event imagesaved
              * Fires when the image_saved callback is return by the OFC component
              * @param {Ext.ux.Chart.OFC} this
              * @param {object} the underlying chart component DOM reference
              */
              'imagesaved'
              
            );

           //function assertion
           this.chartData = this.assert(this.chartData, null);

           if(this.autoLoad || this.chartData){
               this.on('chartload', this.chartAutoLoad, this);
           }
           
           this.mediaCfg.renderOnResize = 
                this.mediaCfg.renderOnResize || (this.ofcCfg || {}).renderOnResize;

       },
       
        /** @private */
       //called just prior to rendering the media
       onBeforeMedia: function(){

         /* assemble a valid mediaCfg */
          var mc = this.mediaCfg;
          var fc = this.ofcCfg || {};
          var fp = Ext.apply({}, this.assert( fc.params,{}));
          var fv = Ext.apply({}, this.assert( fp[this.varsName],{})); 

          Ext.apply(mc , fc, {
              url  : this.chartURL
          });

          Ext.apply(mc.params, fp );

          // flashVars
          Ext.apply(mc.params[this.varsName] || (mc.params[this.varsName]={}), fv || {},
            {'data-file' : this.dataURL || null}
          );
          
          window.ofc_ready = this.onFlashInit.createDelegate(this);
          ofcAdapter.superclass.onBeforeMedia.call(this);

       },

       loadData   : function(json){
           var o;
           json || (json = this.chartData);
           if(json && (o = this.getInterface()) && o.load != undefined){
                  if(this.loadMask && this.autoMask && !this.loadMask.active ){
                       this.loadMask.show();
                  }
                  this.chartData = json;
                  o.load(typeof json == 'object'? Ext.encode(json) : json);

                  //OFC-2 does not notify of render complete
                  //so we synthesize the event here also.
                  this.onChartRendered();
                  return this;
           }
       },

       /** @private  this function is designed to be used when a chart object notifies the browser
        * if its initialization state.  Raised Asynchronously.
        */
       onFlashInit  :  function(){
           ofcAdapter.superclass.onFlashInit.apply(this,arguments);
           this.fireEvent.defer(1,this,['chartload',this, this.getInterface()]);
       },
       
       /** @private */
       onChartRendered   :  function(){
             this.fireEvent('chartrender', this, this.getInterface());
             if(this.loadMask && this.autoMask){this.loadMask.hide();}
       },
        /**
        * Loads this  Chart immediately with JSON content returned from an Ext.Ajax request.
        * @param {Object/String/Function} config A config object containing any of the following options:
       <pre><code>
        panel.load({
           url: "your-url.php",
           params: {param1: "foo", param2: "bar"}, // or a URL encoded string
           callback: yourFunction,
           scope: yourObject, // optional scope for the callback
           nocache: false,
           timeout: 30,
           connectionClass : null, //optional ConnectionClass (Ext.data.Connection or descendant) to use for the request.
       });
       </code></pre>
        * The only required property is url. The optional property nocache is shorthand for disableCaching
        *
        * @return {Ext.ux.Chart.OFC} this
        */
       load   :function(url, params, callback){

          if(this.loadMask && this.autoMask && !this.loadMask.active ){
               this.loadMask.show({
                    fn : arguments.callee.createDelegate(this,arguments)
                   ,fnDelay : 50
                });
               return this;
           }

           var method , cfg, callerScope,timeout,disableCaching ;
           url || (url = this.dataURL);
           if(typeof url == "object"){ // must be config object
               cfg = url;
               url = cfg.url;
               params = params || cfg.params;
               callback = callback || cfg.callback;
               callerScope = cfg.scope;
               method = cfg.method || 'GET';

               disableCaching = cfg.disableCaching || false;
               timeout = cfg.timeout || 30;
           }

           if(typeof url == "function"){
               url = url.call(this);
           }

           method = method || (params ? "POST" : "GET");
           if(method == "GET"){
               if(disableCaching){
                   var append = "_dc=" + (new Date().getTime());
                   if(url.indexOf("?") !== -1){
                       url += "&" + append;
                   }else{
                       url += "?" + append;
                   }
                }
           }

           var o = Ext.apply(cfg ||{}, {
               url : url,
               params: (typeof params == "function" && callerScope) ? params.createDelegate(callerScope) : params,
               success: function(response){
                   this.transaction = false;
                   this.loadData(response.responseText);
                   },
               failure: function(response){this.transaction = false;},
               scope: this,
               callback: callback,
               timeout: (timeout*1000),
               argument: {
                "options"   : cfg,
                "url"       : url,
                "form"      : null,
                "callback"  : callback,
                "scope"     : callerScope || window,
                "params"    : params
               }
           });

           if(o.url){this.transaction = new (o.connectionClass || Ext.data.Connection)().request(o); }

           return this;

       },
        /** @private */
       setMask  : function(ct) {

             ofcAdapter.superclass.setMask.call(this,ct);

             //loadMask reserved for data loading operations only
             //see: ux.Media.MediaMask for Chart object masking
             if(this.loadMask && !this.loadMask.enable){
                 this.loadMask = new Ext.ux.IntelliMask(ct || this[this.mediaEl],
                      Ext.apply({fixElementForMedia:true,autoHide:2000},this.loadMask));
             }


      },

      /** @private autoLoad for Chart series on render.
       * Note: superclasses call autoLoad on render, which is too soon for flash objects.
       */
      chartAutoLoad : function(){

          if(this.chartData){
              this.loadData();
          }else if(this.autoLoad){
              this.load( typeof this.autoLoad == 'object' ? this.autoLoad : {url: this.autoLoad});
          }
       },

      loadMask : false,
      
      /** 
       * Open Flash Chart 2 has an external interface that you can call to make it save an image.
       * @param {String} url The URL of the upload PHP script Example: http://example.com/php-ofc-library/ofc_upload_image.php?name=my_chart.jpg
       * @param {Boolean} debug (optional) If debug is true the browser will open a new window showing the results (and any echo/print statements) but, the imagesaved event is NOT raised.
       *  If it is false, no redirect happens and the imagesaved event is raised.
       *  <p>This feature requires a serverside script (included in the OCF2 Chart Distribution: ofc_upload_image.php<p>
       *  For a Tutorial on this feature, see http://teethgrinder.co.uk/open-flash-chart-2/adv-upload-image.php
       */
      saveAsImage : function(url, debug ){
        var o; 
        if(url && (o = this.getInterface()) && o.save_image != undefined){
                  
            o.save_image(url, 'Ext.ux.Chart.OFC.prototype._saveImageCallback("'+this.id+'")', debug || false);
            return this;
        }
      },
      
      /** @private 
       * Class Method
       * Saved Image Callback handler
       */
      _saveImageCallback : function(ofcComp){
        var c;
        
        if(c = Ext.getCmp(ofcComp)){
          c.fireEvent('imagesaved', c, c.getInterface());
        }
                
      }

    });

    chart.OFC = Ext.extend(Ext.ux.FlashComponent, { ctype : 'Ext.ux.Chart.OFC' });
    Ext.apply(chart.OFC.prototype, ofcAdapter.prototype);
    Ext.reg('openchart', chart.OFC);

    chart.OFC.Panel = Ext.extend(Ext.ux.FlashPanel, {ctype : 'Ext.ux.Chart.OFC.Panel'});
    Ext.apply(chart.OFC.Panel.prototype, ofcAdapter.prototype);
    Ext.reg('openchartpanel', (Ext.ux.OFCPanel = chart.OFC.Panel));

    Ext.ux.OFCWindow = chart.OFC.Window = Ext.extend(Ext.ux.FlashWindow, {ctype : "Ext.ux.OFCWindow"});
    Ext.apply(chart.OFC.Window.prototype, ofcAdapter.prototype);
    Ext.reg('openchartwindow', Ext.ux.OFCWindow);
})();
if (Ext.provide) {
    Ext.provide('uxofc');
}