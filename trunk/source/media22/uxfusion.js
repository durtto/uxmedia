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

    var fusionAdapter = Ext.extend( chart.FlashAdapter, {
        /**
        * @cfg {String} chartData  Raw XML to load when the Chart object is rendered.
        */
       chartData       : '<chart></chart>',

       /**
        * @cfg {String} dataURL Url of the XML Document to load.
        */
       dataURL         : null,

       autoLoad        : null,

       /**
        * @cfg {Object} chartCfg/fusionCfg Flash configuration options.
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
       chartCfg       : {},


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
                               },
                          boundExternals : ['print', 'saveAsImage', 'setDataXML', 'setDataURL']
        },

       /** @private */
       initMedia   : function(){

            //Defined in FlashAdaper superclass
           /**
            * @event chartload
            * Fires when the underlying chart component reports an initialized state
            * @param {Ext.ux.Chart.Fusion} this
            * @param {object} the underlying chart component DOM reference
            */

          /**
           * @event chartrender
           * Fires when the underlying chart component has rendered its chart series data.
           * @param {Ext.ux.Chart.Fusion} this
           * @param {object} the underlying chart component DOM reference
           */



            //For compat with previous versions < 2.1
           this.chartCfg || (this.chartCfg = this.fusionCfg);
           this.chartData = this.dataXML || this.chartData;

           fusionAdapter.superclass.initMedia.call(this);

       },

       /** @private called just prior to rendering the media */
       onBeforeMedia: function(){

         /* assemble a valid mediaCfg for use with Fusion defined Chart SWF variables */
           var mc = this.mediaCfg;
           var cCfg = this.chartCfg || (this.chartCfg = {});
           cCfg.params                = this.assert( cCfg.params,{});
           cCfg.params[this.varsName] = this.assert( cCfg.params[this.varsName],{});

           cCfg.params[this.varsName] = Ext.apply({
              chartWidth  :  '@width' ,
              chartHeight :  '@height',
              debugMode   : 0,
              DOMId       : '@id',
            registerWithJS: 1,
         allowScriptAccess: "@scripting" ,
              lang        : 'EN',
              dataXML     : this.dataXML || this.chartData || null,
              dataURL     : this.dataURL ? encodeURI(this.prepareURL(this.dataURL)) : null
          }, cCfg.params[this.varsName]);

          fusionAdapter.superclass.onBeforeMedia.call(this);

      },



       /**
        * @cfg {String} setDataMethod The method name to use to set the charts current data series.
        * Indicates to the chartAutoLoad method, what the actual loadData methos is for this class.
        */
      setDataMethod : 'loadData',

    /**
     * Set/update the current chart with a new XML Data series
     * @param {String} xml The XML stream to update with.
     * @param {Boolean) immediate false to defer rendering the new data until the next chart rendering.
     */
      loadData  : function(xml, immediate){
           var o;
           this.chartData = xml;
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

              }
           }
           o = null;
        }



      /**
        * Set/update the current chart with a new XML Data series
        * @param {String} url The URL of the XML stream to update with.
        * @param {Boolean) immediate false to defer rendering the new data until the next chart rendering.
        */
       /*setDataURL  : function(url,immediate){
          var o;

          this.chartData = null;
          this.dataURL = url;
          if((o = this.getInterface()) && immediate){
              //FusionCharts Free has no support for dynamic loading of URLs
              o.setDataURL !== undefined ? o.setDataURL(url) : this.load(url);
              o=null;
          }
        }*/


    });


    window.FC_Rendered = window.FC_Rendered ? window.FC_Rendered.createInterceptor(chart.FlashAdapter.chartOnRender):chart.FlashAdapter.chartOnRender;
    window.FC_Loaded   = window.FC_Loaded   ? window.FC_Loaded.createInterceptor(chart.FlashAdapter.chartOnLoad):chart.FlashAdapter.chartOnLoad;

    Ext.ux.Chart.Fusion = Ext.extend(Ext.ux.FlashComponent, { ctype : 'Ext.ux.Chart.Fusion' });
    Ext.apply(Ext.ux.Chart.Fusion.prototype, fusionAdapter.prototype);
    Ext.reg('fusion', Ext.ux.Chart.Fusion);

    Ext.ux.Chart.Fusion.Panel = Ext.extend(Ext.ux.FlashPanel, {ctype : 'Ext.ux.Chart.Fusion.Panel'});
    Ext.apply(Ext.ux.Chart.Fusion.Panel.prototype, fusionAdapter.prototype);
    Ext.reg('fusionpanel', Ext.ux.Chart.Fusion.Panel);

    Ext.ux.Chart.Fusion.Window = Ext.extend(Ext.ux.FlashWindow, {ctype : "Ext.ux.Chart.Fusion.Window"});
    Ext.apply(Ext.ux.Chart.Fusion.Window.prototype, fusionAdapter.prototype);
    Ext.reg('fusionwindow', Ext.ux.Chart.Fusion.Window);
})();
if (Ext.provide) {
    Ext.provide('uxfusion');
}