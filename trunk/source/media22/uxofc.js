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
   dataFn      : the name of an accessible function which return the initial chart series as a JSON string.
   autoLoad    : Use Ext.Ajax to remote load a JSON chart series
   chartData   : (optional object/JSON string/Function) Chart data series to load when initially rendered.  May be an object, JSONString, or Function that returns either.
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

    var ofcAdapter = Ext.extend( chart.FlashAdapter , {

       /**
        * @cfg {String|Float} requiredVersion The required Flash version necessary to support the Chart object.
        * @default "9"
        */
       requiredVersion : 9,


       /** @private */
       mediaCfg        : {url       : null,
                          id        : null,
                          start     : true,
                          controls  : true,
                          name      :'@id',
                          height    : '@height',
                          width     : '@width',
                          autoSize  : false,
                          start     :false,
                          renderOnResize:false,
                          scripting : 'always',
                          cls       :'x-media x-media-swf x-chart-ofc',
                          params    : {
                             allowscriptaccess : '@scripting',
                             wmode     :'transparent',
                             scale     :'noscale',
                             flashVars : {
                                 'get-data'  : null,  //function name to call for initial data
                                 'data-file' : null,  //URL for initial data
                                 id: '@id'
                             }
                            }
        },

        /** @private */
       initMedia  : function(){

           this.addEvents(

              /**
              * @event imagesaved
              * Fires when the image_saved callback is return by the OFC component
              * @param {Ext.ux.Chart.OFC} this
              * @param {object} the underlying chart component DOM reference
              */
              'imagesaved'

            );

           //For compat with previous versions < 2.1
           this.chartCfg || (this.chartCfg = this.ofcCfg);

           ofcAdapter.superclass.initMedia.call(this);

       },

        /** @private */
       //called just prior to rendering the media
       onBeforeMedia: function(){

         /* assemble a compatible mediaCfg for use with the defined Chart SWF variables */
           var mc = this.mediaCfg;
           var cCfg = this.chartCfg || (this.chartCfg = {});
           cCfg.params                = this.assert( cCfg.params,{});
           cCfg.params[this.varsName] = this.assert( cCfg.params[this.varsName],{});

           cCfg.params[this.varsName] = Ext.apply({
                'data-file' : this.prepareURL(this.dataURL || null),
                'get-data'  : this.dataFn || null,
                allowResize : !!this.resizable
               }, cCfg.params[this.varsName] );

           ofcAdapter.superclass.onBeforeMedia.call(this);

       },
       /**
       * @cfg {String} setDataMethod The method name to use to set the charts current data series.
       */
       setDataMethod : 'loadData',

       loadData   : function(json){
           var o, j;

           j = this.assert(json ,null);

           if(json && (o = this.getInterface()) && o.load != undefined){
                  if(this.loadMask && this.autoMask && !this.loadMask.active ){
                       this.loadMask.show();
                  }

                  o.load(typeof j == 'object'? Ext.encode(j) : j);

                  //OFC-2 does not notify of render complete
                  //so we synthesize the event here also.
                  this.onChartRendered();
                  return this;
           }
       },


       /**
       * When initially rendered, the OFC Flash object MAY invoke the 'window.open_flash_chart_data' method
       * in an effort to render some chart series of choice.
       * ux.Chart.OFC proxies this method when called.
       * Re-define this method of your chart instance to return the desired initial data series.
       * @return {JSONString} must return a JSON string used to *initially* render the chart.
       */

       onDataRequest : function() {

           var json;
           if(json = this.assert(this.chartData ,{}) ){
               return typeof json == 'object'? Ext.encode(json) : json;
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

            o.save_image(url, 'Ext.ux.Chart.OFC.Adapter._saveImageCallback("'+this.id+'")', debug || false);
            return this;
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

     /* Class Proxy Methods */
    chart.OFC.Adapter = Ext.apply(ofcAdapter,{

        /** @private  Class method callbacks */
        chartDataRequest : function(DOMId){

            var c, d = Ext.get(DOMId);
            if(d && (c = d.ownerCt)){

                return c.onDataRequest?c.onDataRequest():'{}';
            }
            d= null;
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

    window.ofc_ready = window.ofc_ready ?
            window.ofc_ready.createInterceptor(chart.FlashAdapter.chartOnLoad )
           :chart.FlashAdapter.chartOnLoad;

    window.open_flash_chart_data = window.open_flash_chart_data ?
            window.open_flash_chart_data.createInterceptor(chart.OFC.Adapter.chartDataRequest )
           :chart.OFC.Adapter.chartDataRequest;
})();

if (Ext.provide) {
    Ext.provide('uxofc');
}