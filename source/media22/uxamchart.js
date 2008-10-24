/* global Ext */
/*
 * @class Ext.ux.Chart.amChart
 * @version 1.0a
 * @author Doug Hendricks. doug[always-At]theactivegroup.com
 * Copyright 2007-2008, Active Group, Inc.  All rights reserved.
 *
 ************************************************************************************
 *   This file is distributed on an AS IS BASIS WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 ************************************************************************************

     License: Ext.ux.Chart.amChart is licensed under the
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

 Component Config Options:

   chartUrl    : the URL of the desired amChart_Chart_Object.swf
   chartData   : String stream containing chart layout config and data series.
   dataUrl     : the URL of a remote dataXML resource
   settingsUrl : This line tells amline.swf the name of a settings file. The charts can have more than one setting file.

   loadMask    : loadMask config, true, or false. applied during data load operations.
   mediaMask   : loadMask config, true, or false. applied while the SWF object is loading( not the data)
   autoMask    : true permits the Component to automatically manage the media and load masks.
   chartCfg  : {  //optional
            id    : String   id of <object> tag
            style : Obj  optional DomHelper style config object
            height : Fixed/percentage height of the chart object
            width  : Fixed/percentage width of the chart object
            params: {

                flashVars : {
                    path        : This line tells the amline.swf where it should look for all the additional files, such as fonts, export as image files, custom icons. Do not forget to add "/" at the end of this line.
                    chart_settings : This line is used for including settings directly in the HTML file instead of loading them from an external file.
                    additional_chart_settings : This line is used for appending settings to the ones you loaded from a file or set with the chart_settings (the line above).
                    loading_settings : If you want to change the "Loading settings" text that is displayed while the settings are loaded, you can set your own text here.
                    loading_data : If you want to change the "Loading data" text that is displayed while the data is loaded, you can set your own text here.
                    preloader_color : The loading bar and text of a loading message can be set here.

                }
            }
        }

 This class inherits from (thus requires) the :
     ux.Media(uxmedia.js),
     ux.Media.Flash (uxflash.js) ,
     ux.Chart.FlashAdapter (uxchart.js)
     classes

*/
(function(){
    Ext.namespace("Ext.ux.Chart");

    var chart = Ext.ux.Chart;

    var amchartAdapter = Ext.extend( chart.FlashAdapter, {


       /** @private */
       initMedia   : function(){


           this.addEvents(

               /**
                * @event returndata
                * Fires when you request data from a chart by calling the getData() function.
                * @param {Ext.ux.Chart} this
                * @param {object} the underlying chart component DOM reference
                * @param {Mixed} The data
                */

               'returndata',

              /**
               * @event returnsettings
               * Fires when you request settings from a chart by calling the getSettings() function.
               * @param {Ext.ux.Chart} this
               * @param {object} the underlying chart component DOM reference
               * @param {Mixed} The settings
               */
               'returnsettings',

               /**
                 * @event returnimagedata
                 * Fires when the underlying chart component has exported the chart as an image, the chart passes image data to this event.
                 * @param {Ext.ux.Chart} this
                 * @param {object} the underlying chart component DOM reference
                 * @param {Mixed} The data
                 */
               'returnimagedata',

                /**
                 * @event returnparam
                 * Fires when you request data from a chart by calling the getParam() function.
                 * @param {Ext.ux.Chart} this
                 * @param {object} the underlying chart component DOM reference
                 * @param {Mixed} The param value
                 */
               'returnparam',

                /**
                 * @event error
                 * Fires when the chart reports an error condition.
                 * @param {Ext.ux.Chart} this
                 * @param {object} the underlying chart component DOM reference
                 * @param {Mixed} The Error.
                 */

               'error'
            );

            amchartAdapter.superclass.initMedia.call(this);

       },

       chartCfg       : {},

       /** @private
        * default mediaCfg(chartCfg) for a Chart object
        */
       mediaCfg        : {url      : null,
                          id       : null,
                          start    : true,
                          controls : true,
                          height  : null,
                          width   : null,
                          autoSize : true,
                          renderOnResize:false,
                          scripting : 'always',
                          cls     :'x-media x-media-swf x-chart-amchart',

                           //Auto ExternalInterface Bindings (Flash v8 or higher)
                          boundExternals : ['setData', 'appendData', 'setSettings',
                                            'getSettings', 'rebuild', 'reloadData',
                                            'reloadSettings', 'reloadAll', 'setParam',
                                            'getParam', 'getData', 'exportImage',
                                            'print', 'printAsBitmap' ],

                          params  : {
                              wmode     :'transparent',
                              scale     :'exactfit',
                              scale       : null,
                              salign      : null
                               }
        },

        setDataMethod : 'setData',

        /** @private called just prior to rendering the media */
         onBeforeMedia: function(){

         /* assemble a compatible mediaCfg for use with the defined Chart SWF variables */
          var mc = this.mediaCfg;
          var cCfg = this.chartCfg || (this.chartCfg = {});

          cCfg.params                = this.assert( cCfg.params,{});
          cCfg.params[this.varsName] = this.assert( cCfg.params[this.varsName],{});

          cCfg.params[this.varsName] = Ext.apply({
             "preloader_color"  : "#999999",
              path              : null,
              chart_id          : '@id',
             "chart_data"       : this.assert(this.chartData, null),
             "chart_settings"   : null,
             "data_file"        : this.dataURL ? encodeURI(this.prepareURL(this.dataURL)) : null,
             "settings_file"    : this.settingsURL ? encodeURI(this.prepareURL(this.settingsURL)) :null
          }, cCfg.params[this.varsName] );

          amchartAdapter.superclass.onBeforeMedia.call(this);


          var re = /(?:<settings([^>]*)?>)((\n|\r|.)*?)(?:<\/settings>)/ig;
          var match = re.exec(mc.params[this.varsName]["additional_chart_settings"]||'');

          var extras= match && match[2]?[match[2]]:[];
          if(mc.autoSize){
              extras.push('<redraw>true</redraw>'); }
          if(this.disableCaching){
              extras.push('<add_time_stamp>true</add_time_stamp>'); }

          if(!!extras.length){
             mc.params[this.varsName]["additional_chart_settings"]= '<settings>'+extras.join('')+'</settings>';
          }


      },


     /**
      * Set/update the current chart with a new Data series
      * @param {String} url The URL of the stream to update with.
      * @param {Boolean) immediate false to defer rendering the new data until the next chart rendering.
      */
      setDataURL  : function(url,immediate){
          var o;
          var vars = this.mediaCfg.params[this.varsName]||{};

          this.dataURL = url;
          if((o = this.getInterface()) && immediate !== false){
              o.setParam !== undefined ? o.setParam("data_file", encodeURI(this.prepareURL(url)) ) : this.load(url);
              o=null;
          }
       }
    });

    window.amChartInited =
        typeof window.amChartInited == 'function'  ?
            window.amChartInited.createInterceptor(chart.FlashAdapter.chartOnLoad):
                 chart.FlashAdapter.chartOnLoad;



    var dispatchEvent = function(name, id){

        var c, d = Ext.get(id);
        if(d && (c = d.ownerCt)){
           c.fireEvent.apply(c, [name, c, c.getInterface()].concat(Array.prototype.slice.call(arguments,2)));
        }
        c = d =null;
    };

    //Bind amChart callbacks to an Ext.Event for the corresponding chart.
    Ext.each(['amReturnData', 'amReturnSettings' ,'amReturnImageData','amReturnParam','amError',

      //These are unique to the stock Chart object
      'amRolledOver', 'amClickedOn', 'amRolledOverEvent', 'amClickedOnEvent', 'amGetZoom'],

      function(fnName){
        var cb = dispatchEvent.createDelegate(null,[fnName.toLowerCase().replace(/^am/,'')],0);
        window[fnName] = typeof window[fnName] == 'function' ? window[fnName].createInterceptor(cb): cb ;

     });


    Ext.ux.Chart.amChart = Ext.extend(Ext.ux.FlashComponent, { ctype : 'Ext.ux.Chart.amChart' });
    Ext.apply(Ext.ux.Chart.amChart.prototype, amchartAdapter.prototype);
    Ext.reg('amchart', Ext.ux.Chart.amChart);

    Ext.ux.Chart.amChart.Panel = Ext.extend(Ext.ux.FlashPanel, {ctype : 'Ext.ux.Chart.amChart.Panel'});
    Ext.apply(Ext.ux.Chart.amChart.Panel.prototype, amchartAdapter.prototype);
    Ext.reg('amchartpanel', Ext.ux.Chart.amChart.Panel);

    Ext.ux.Chart.amChart.Window = Ext.extend(Ext.ux.FlashWindow, {ctype : "Ext.ux.Chart.amChart.Window"});
    Ext.apply(Ext.ux.Chart.amChart.Window.prototype, amchartAdapter.prototype);
    Ext.reg('amchartwindow', Ext.ux.Chart.amChart.Window);


    /*Stock chart class */

    var amstockAdapter = Ext.extend( amchartAdapter , {

       /** @private
        * default mediaCfg(chartCfg) for a Chart object
        */
        mediaCfg   : {url      : null,
                      id       : null,
                      start    : true,
                      controls : true,
                      height  : null,
                      width   : null,
                      autoSize : true,
                      renderOnResize:false,
                      scripting : 'always',
                      cls     :'x-media x-media-swf x-chart-amstock',

                       //Auto ExternalInterface Bindings (Flash v8 or higher)
                      boundExternals : ['setData', 'appendData', 'setSettings',
                                        'getSettings', 'rebuild', 'reloadData',
                                        'reloadSettings', 'reloadAll', 'setParam',
                                        'getParam', 'getData', 'exportImage',
                                        'print', 'printAsBitmap', 'setZoom',
                                        'showAll', 'selectDataset', 'compareDataset',
                                        'uncompareDataset', 'uncompareAll'
                                        ],

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
                      * @event rolledover
                      * Fires when indicator position changes.
                      * @param {Ext.ux.Chart} this
                      * @param {object} the underlying chart component DOM reference
                      * @param {String} The date.
                      * @param {String} Period.
                      */

                     'rolledover',

                    /**
                     * @event clickedon
                     * Fires when when user clicks on plot area.
                     * @param {Ext.ux.Chart} this
                     * @param {object} the underlying chart component DOM reference
                     * @param {String} The date.
                     * @param {String} Period.
                     */
                     'clickedon',

                     /**
                       * @event rolledoverevent
                       * Fires when the when user roll-overs some event.
                       * @param {Ext.ux.Chart} this
                       * @param {object} the underlying chart component DOM reference
                       * @param {String} The date.
                       * @param {String} Description.
                       * @param {String} id.
                       * @param {String} URL.
                       */
                      'rolledoverevent',

                      /**
                       * @event clickedonevent
                       * Fires when when user clicks on some event.
                       * @param {Ext.ux.Chart} this
                       * @param {object} the underlying chart component DOM reference
                       * @param {String} The date.
                       * @param {String} Description.
                       * @param {String} id.
                       * @param {String} URL.
                       */
                       'clickedonevent',


                      /**
                       * @event getzoom
                       * Fires when the selected period is changed
                       * @param {Ext.ux.Chart} this
                       * @param {object} the underlying chart component DOM reference
                       * @param {Mixed} From
                       * @param {Mixed} To
                       */

                     'getzoom'
                  );

                  amstockAdapter.superclass.initMedia.call(this);

          }

    });

    Ext.ux.Chart.amStock = Ext.extend(Ext.ux.FlashComponent, { ctype : 'Ext.ux.Chart.amStock' });
    Ext.apply(Ext.ux.Chart.amStock.prototype, amstockAdapter.prototype);
    Ext.reg('amstock', Ext.ux.Chart.amStock);

    Ext.ux.Chart.amStock.Panel = Ext.extend(Ext.ux.FlashPanel, {ctype : 'Ext.ux.Chart.amStock.Panel'});
    Ext.apply(Ext.ux.Chart.amStock.Panel.prototype, amstockAdapter.prototype);
    Ext.reg('amstockpanel', Ext.ux.Chart.amStock.Panel);

    Ext.ux.Chart.amStock.Window = Ext.extend(Ext.ux.FlashWindow, {ctype : "Ext.ux.Chart.amStock.Window"});
    Ext.apply(Ext.ux.Chart.amStock.Window.prototype, amstockAdapter.prototype);
    Ext.reg('amstockwindow', Ext.ux.Chart.amStock.Window);


})();

if (Ext.provide) {
    Ext.provide('uxamchart');
}