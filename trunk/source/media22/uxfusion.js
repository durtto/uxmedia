/* global Ext */
/*
 * @class Ext.ux.Chart.Fusion
 * Version:  2.1
 * Author: Doug Hendricks. doug[always-At]theactivegroup.com
 * Copyright 2007-2008, Active Group, Inc.  All rights reserved.
 *
 ************************************************************************************
 *   This file is distributed on an AS IS BASIS WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 ************************************************************************************

     License: Ext.ux.Chart.Fusion is licensed under the
     terms of : GNU Open Source GPL 3.0 license:

     This program is free software for non-commercial use: you can redistribute
     it and/or modify it under the terms of the GNU General Public License as
     published by the Free Software Foundation, either version 3 of the License, or
     any later version.

     This program is distributed in the hope that it will be useful,
     but WITHOUT ANY WARRANTY; without even the implied warranty of
     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
     GNU General Public License for more details.

     You should have received a copy of the GNU General Public License
     along with this program.  If not, see < http://www.gnu.org/licenses/gpl.html>.

   Donations are welcomed: http://donate.theactivegroup.com
   Commercial use is prohibited without a Commercial License. See http://licensing.theactivegroup.com.

 Version:  2.1

 Component Config Options:

   chartUrl    : the URL of the desired Fusion_Chart_Object.swf
   dataXML     : String  XML stream containing chart layout config and data series.
   dataUrl     : the URL of a remote dataXML resource
   loadMask    : loadMask config, true, or false. applied during data load operations.
   mediaMask   : loadMask config, true, or false. applied while the SWF object is loading( not the data)

   fusionCfg  : {  //optional
            id    : String   id of <object> tag
            style : Obj  optional DomHelper style object
            params: {

                flashVars : {
                    chartWidth  : defaults to SWF Object geometry
                    chartHeight : defaults to SWF Object geometry
                    debugMode   : Fusion debug mode (0,1)
                    DOMId       : DOM Id of SWF object (defaults to assigned macro '@id')
                    registerWithJS: Fusion specific (0,1)
                    lang        : default 'EN',
                    dataXML     : An XML string representing the chart canvas config and data series
                    dataUrl     : A Url to load an XML resource (dataXML)
                }
            }
        }

 This class inherits from (thus requires) the ux.Media(uxmedia.js) and ux.Media.Flash (uxflash.js) classes

*/
(function(){
    Ext.namespace("Ext.ux.Chart");

    var chart = Ext.ux.Chart;
    var Media = Ext.ux.Media;

    var fusionAdapter = Ext.extend( Media.Flash , {

       /**
        * @cfg {String|Float} requiredVersion The required Flash version necessary to support the Chart object.
        * @default "9"
        */
       requiredVersion : 8,

       /**
        * @cfg {Mixed} unsupportedText Text Markup/DOMHelper config displayed when the Flash Plugin is not available
        */
       unsupportedText : {cn:['The Adobe Flash Player{0}is required.',{tag:'br'},{tag:'a',cn:[{tag:'img',src:'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif'}],href:'http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash',target:'_flash'}]},

       /**
        * @cfg {String} chartURL Url of the Fusion Flash Chart object.
        */
       chartURL        : null,

       /**
        * @cfg {String} dataXML Raw XML to load when the Chart object is rendered.
        */
       dataXML         : '<chart></chart>',

       /**
        * @cfg {String} dataURL Url of the XML Document to load.
        */
       dataURL         : null,

       autoLoad        : null,
       /**
        * @cfg {Object} fusionCfg Flash configuration options.
        * @example fusionCfg  : {  //optional
            id    : String   id of <object> tag
            style : Obj  optional DomHelper style object
            params: {

                flashVars : {
                    chartWidth  : defaults to SWF Object geometry
                    chartHeight : defaults to SWF Object geometry
                    debugMode   : Fusion debug mode (0,1)
                    DOMId       : DOM Id of SWF object (defaults to assigned macro '@id')
                    registerWithJS: Fusion specific (0,1)
                    lang        : default 'EN',
                    dataXML     : An XML string representing the chart canvas config and data series
                    dataUrl     : A Url to load an XML resource (dataXML)
                }
            }
        }
        */
       fusionCfg       : {},


       /**
        * @cfg {String} autoScroll
        * @default "false"
        */
       autoScroll      : false,

       /** @private
        * default mediaCfg(fusionCfg) for a FusionChart object
        */
       mediaCfg        : {url      : null,
                          id       : null,
                          start    : true,
                          controls : true,
                          height  : null,
                          width   : null,
                          autoSize : true,
                          renderOnResize:true, //Fusion required after reflow
                          scripting : 'always',
                          cls     :'x-media x-media-swf x-chart-fusion',
                          params  : {
                              wmode     :'transparent',
                              scale     :'exactfit',
                              scale       : null,
                              salign      : null
                               }
        },

       /** @private */
       initMedia   : function(){

           this.addEvents(

               /**
                * @event chartload
                * Fires when the underlying chart component reports an initialized state
                * @param {Ext.ux.Chart.Fusion} this
                * @param {object} the underlying chart component DOM reference
                */

               'chartload',

              /**
               * @event chartrender
               * Fires when the underlying chart component has rendered its chart series data.
               * @param {Ext.ux.Chart.Fusion} this
               * @param {object} the underlying chart component DOM reference
               */
               'chartrender'
            );

           if(this.autoLoad){
              this.on('chartload', this.chartAutoLoad, this);
           }

           fusionAdapter.superclass.initMedia.call(this);

           this.mediaCfg.renderOnResize =
                this.mediaCfg.renderOnResize || (this.fusionCfg || {}).renderOnResize;
       },

       /** @private called just prior to rendering the media */
       onBeforeMedia: function(){

         /* assemble a valid mediaCfg for use with Fusion defined Chart SWF variables */
          var mc = this.mediaCfg;
          var fc = this.fusionCfg || {};
          var fp = Ext.apply({}, this.assert( fc.params,{}));
          var fv = Ext.apply({}, this.assert( fp[this.varsName],{}));


          Ext.apply(mc , fc, {
              url  : this.chartURL || null

          });

          Ext.apply(mc.params, fp );

          mc.params[this.varsName] || (mc.params[this.varsName] ={ });

          Ext.apply(mc.params[this.varsName], fv , {
              chartWidth  :  '@width' ,
              chartHeight :  '@height',
              debugMode   : 0,
              DOMId       : '@id',
            registerWithJS: 1,
         allowScriptAccess: "@scripting" ,
              lang        : 'EN',
              dataXML     : this.dataXML || null,
              dataURL     : this.dataURL || null
          });

          var url= (url=mc.params[this.varsName]['dataURL'])?encodeURI(url):null;

          fusionAdapter.superclass.onBeforeMedia.call(this);

      },

      /**
       * Saves/downloads the chart as an image file.
         Serverside script required to support this method fully.
         Include the imageSaveURL attribute in
         the chart XML markup to designate the URL of the script:
          @example chart1.setDataXML("<chart imageSave='1' imageSaveURL='http://<<Path to your script>>/FusionChartsSave.aspx' ><set label='A' value='10' />
      */
      saveAsImage : function(){
           var o;

           if((o = this.getInterface()) && o.saveAsImage !== undefined){
                o.saveAsImage();
           }

      },
    /**
     * Set/update the current chart with a new XML Data series
     * @param {String} xml The XML stream to update with.
     * @param {Boolean) immediate false to defer rendering the new data until the next chart rendering.
     */
      setDataXML  : function(xml, immediate){
           var o;
           this.dataXML = xml;
           if( immediate && (o = this.getInterface())){

              if( o.setDataXML !== undefined ){

                   o.setDataXML(xml);

              } else { //FC Free Interface
                   this.setVariable("_root.dataURL","");
                   //Set the flag
                   this.setVariable("_root.isNewData","1");
                    //Set the actual data
                   this.setVariable("_root.newData",xml);
                   //Go to the required frame
                   o.TGotoLabel("/", "JavaScriptHandler");

                   //Fusion Free only raises FC_render event when IT retrieves from a URL,
                   //so we synthesize the event here also.
                   //this.onChartRendered();
              }
           }
           o = null;
        },

     /**
      * Set/update the current chart with a new XML Data series
      * @param {String} url The URL of the XML stream to update with.
      * @param {Boolean) immediate false to defer rendering the new data until the next chart rendering.
      */
      setDataURL  : function(url,immediate){
          var o;
          var vars = this.mediaCfg.params[this.varsName]||{};
          this.dataXML = null;
          this.dataURL = url;
          if((o = this.getInterface()) && immediate){
              //FusionCharts Free has no support for dynamic loading of URLs
              o.setDataURL !== undefined ? o.setDataURL(url) : this.load(url);
              o=null;
          }
       },

        /**
        * Loads this Fusion Chart immediately with XML content returned from an XHR call.
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
        * @return {Ext.ux.Chart.Fusion} this
        */

       load   :function(url, params, callback){
           if(!url){return this;}

           if(this.loadMask && this.autoMask && !this.loadMask.active ){

                this.loadMask.show({
                     fn : arguments.callee.createDelegate(this,arguments)
                    ,fnDelay : 80
                 });
                return this;
           }

           var method , cfg, callerScope,timeout,disableCaching ;


           if(typeof url === "object"){ // must be config object
               cfg = url;
               url = cfg.url;
               params = params || cfg.params;
               callback = callback || cfg.callback;
               callerScope = cfg.scope;
               method = cfg.method || 'GET';
               disableCaching = cfg.disableCaching || false;
               timeout = cfg.timeout || 30;
           }

           if(typeof url === "function"){
               url = url.call(this);
           }

           method = method || (params ? "POST" : "GET");
           if(method === "GET"){
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
               params: (typeof params === "function" && callerScope) ? params.createDelegate(callerScope) : params,
               success: function(response){
                   this.setDataXML(response.responseText,true);

                   },
               failure: function(response){
                   this.setDataXML('Failure',true);

                   },
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

           new (o.connectionClass || Ext.data.Connection)().request(o);

           return this;

       },
       /** @private */
      setMask  : function(ct) {

          fusionAdapter.superclass.setMask.call(this, ct);

          //loadMask reserved for data loading operations only
          //see: @cfg:mediaMask for Chart object masking
          if(this.loadMask && !this.loadMask.enable){
              this.loadMask = new Ext.ux.IntelliMask(ct || this[this.mediaEl],
                   Ext.apply({fixElementForMedia:true, autoHide:4000},this.loadMask));
          }

      },
       /** @private  autoLoad for Chart (XML) series on flashinit(chartload). */
      chartAutoLoad : function(){
         this.load(
           typeof this.autoLoad === 'object' ?
               this.autoLoad : {url: this.autoLoad});
       },
       /**
        * Prints the chart if the print method is supported
        */
       print  : function() {
           var i; if((i=this.getInterface()) && typeof i.print !== 'undefined'){i.print();}
       },
       /** @private */
       onChartRendered   :  function(){
             this.fireEvent('chartrender', this, this.getInterface());
             if(this.loadMask && this.autoMask){this.loadMask.hide();}
       },
       /** @private */
       onChartLoaded   :  function(){
            this.fireEvent('chartload', this, this.getInterface());
            if(this.mediaMask && this.autoMask){this.mediaMask.hide();}
       },
       loadMask : false

    });


    /** @private  Class method callbacks */
    fusionAdapter.chartOnLoad = function(DOMId){
        var c, d = Ext.get(DOMId);
        if(d && (c = d.ownerCt)){
            c.onChartLoaded.call( c);
            c = d=null;
            return false;
        }
        d= null;
    };

    /** @private  Class method callbacks */
    fusionAdapter.chartOnRender = function(DOMId){
        var c, d = Ext.get(DOMId);
        if(d && (c = d.ownerCt)){
            c.onChartRendered.call( c);
            c = d = null;
            return false;
        }
        d= null;
    };

    window.FC_Rendered = window.FC_Rendered ? window.FC_Rendered.createInterceptor(fusionAdapter.chartOnRender):fusionAdapter.chartOnRender;
    window.FC_Loaded   = window.FC_Loaded   ? window.FC_Loaded.createInterceptor(fusionAdapter.chartOnLoad):fusionAdapter.chartOnLoad;

    chart.Fusion = Ext.extend(Ext.ux.FlashComponent, { ctype : 'Ext.ux.Chart.Fusion' });
    Ext.apply(chart.Fusion.prototype, fusionAdapter.prototype);
    Ext.reg('fusion', chart.Fusion);

    chart.Fusion.Panel = Ext.extend(Ext.ux.FlashPanel, {ctype : 'Ext.ux.Chart.Fusion.Panel'});
    Ext.apply(chart.Fusion.Panel.prototype, fusionAdapter.prototype);
    Ext.reg('fusionpanel', (Ext.ux.FusionPanel = chart.Fusion.Panel));

    Ext.ux.FusionWindow = chart.Fusion.Window = Ext.extend(Ext.ux.FlashWindow, {ctype : "Ext.ux.FusionWindow"});
    Ext.apply(chart.Fusion.Window.prototype, fusionAdapter.prototype);
    Ext.reg('fusionwindow', Ext.ux.FusionWindow);
})();
if (Ext.provide) {
    Ext.provide('uxfusion');
}