
(function(){
    Ext.namespace("Ext.ux.Chart");

    var chart = Ext.ux.Chart;
    var Media = Ext.ux.Media;

    chart.FlashAdapter = Ext.extend( Media.Flash , {

       /**
        * @cfg {String|Float} requiredVersion The required Flash version necessary to support the Chart object.
        * @default "8"
        */
       requiredVersion : 8,

       /**
        * @cfg {Mixed} unsupportedText Text Markup/DOMHelper config displayed when the Flash Plugin is not available
        */
       unsupportedText : {cn:['The Adobe Flash Player{0}is required.',{tag:'br'},{tag:'a',cn:[{tag:'img',src:'http://www.adobe.com/images/shared/download_buttons/get_flash_player.gif'}],href:'http://www.adobe.com/shockwave/download/download.cgi?P1_Prod_Version=ShockwaveFlash',target:'_flash'}]},

       /**
        * @cfg {String} chartURL Url of the Flash Chart object.
        */
       chartURL        : null,

       /**
        * @cfg {Object/JSON string/Function) Chart data series to load when initially rendered. <p> May be an object, JSONString, or Function that returns either.
        */
       chartData       : null,

       /**
        * @cfg {String} dataURL Url of the XML Document to load.
        */
       dataURL         : null,

       autoLoad        : null,

       /**
        * @cfg {Object} chartCfg Flash configuration options.
        * @example chartCfg  : {  //optional
            id    : String   id of <object> tag
            style : Obj  optional DomHelper style object
            params: {

                flashVars : {
                    chartWidth  : defaults to SWF Object geometry
                    chartHeight : defaults to SWF Object geometry
                    DOMId       : DOM Id of SWF object (defaults to assigned macro '@id')
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
                          cls     :'x-media x-media-swf x-chart',
                          params  : {
                              allowscriptaccess : '@scripting',
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
                * @param {Ext.ux.Chart} this
                * @param {object} the underlying chart component DOM reference
                */

               'chartload',

              /**
               * @event chartrender
               * Fires when the underlying chart component has rendered its chart series data.
               * @param {Ext.ux.Chart} this
               * @param {object} the underlying chart component DOM reference
               */
               'chartrender'
            );

           if(this.autoLoad){
              this.on('chartload', this.doAutoLoad, this, {delay:100});
           }

           this.mediaCfg.renderOnResize =
                this.mediaCfg.renderOnResize || (this.chartCfg || {}).renderOnResize;

           chart.FlashAdapter.superclass.initMedia.call(this);
       },

       /** @private called just prior to rendering the media
        * Merges chartCfg with default Flash mediaCfg for charting
        */
       onBeforeMedia: function(){

          /* assemble a valid mediaCfg */
          var mc =  this.mediaCfg;
          var mp = mc.params||{};
          delete mc.params;
          var mv = mp[this.varsName]||{};
          delete mp[this.varsName];

          //chartCfg
          var cCfg = Ext.apply({},this.chartCfg || {});

           //chart params
          var cp = Ext.apply({}, this.assert( cCfg.params,{}));
          delete cCfg.params;

           //chart.params.flashVars
          var cv = Ext.apply({}, this.assert( cp[this.varsName],{}));
          delete cp[this.varsName];

          Ext.apply(mc , cCfg, {
              url  : this.assert(this.chartURL, null)
          });

          mc.params = Ext.apply(mp,cp);
          mc.params[this.varsName] = Ext.apply(mv,cv);

          chart.FlashAdapter.superclass.onBeforeMedia.call(this);

      },

     /**
      * Set/update the current chart with a new XML Data series
      * @param {String} url The URL of the XML stream to update with.
      * @param {Boolean) immediate false to defer rendering the new data until the next chart rendering.
      */
     setDataURL  : function(url,immediate){ },

     /**
      * Loads this Chart immediately with XML content returned from an XHR call.
      * @param {Object/String/Function} config A config object containing any of the following options:
       <pre><code>
        panel.chartAutoLoad ({
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
        * @return {Ext.ux.Chart} this
        */

       chartAutoLoad  :  function(url, params, callback){

           if(!url){return this;}

           if(this.loadMask && this.autoMask && !this.loadMask.active ){

                this.loadMask.show({
                     fn : arguments.callee.createDelegate(this,arguments)
                    ,fnDelay : 50
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
               disableCaching = cfg.disableCaching || this.disableCaching;
               timeout = cfg.timeout || 30;
           }


           url = this.assert(url);


           method = method || (params ? "POST" : "GET");
           if(method === "GET"){
               url = this.prepareURL(url, disableCaching );
           }

           var o = Ext.apply(cfg ||{}, {
               url : url,
               params: (typeof params === "function" && callerScope) ? params.createDelegate(callerScope) : params,
               success: function(response){
                        this.setChartData(response.responseText,true);
               },
               failure: function(response){
                        console.log('Failure', arguments);
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

      setChartData  : function(data){
          if(this.setDataMethod === 'setChartData'){
              throw 'Invalid Method Reference for: setChartData';
          }
          var iface;
          var method = this[this.setDataMethod] /* via ExternalInterface or class Method */
                    || (iface =this.getInterface() ?
                             iface[this.setDataMethod] /* or SWF direct function call */
                               :null);

          if (method && typeof method != 'undefined'){
              method.call(this, this.assert(data,null));
          }

      },
       /** @private */
      setMask  : function(ct) {

          chart.FlashAdapter.superclass.setMask.call(this, ct);

          //loadMask reserved for data loading operations only
          //see: @cfg:mediaMask for Chart object masking
          if(this.loadMask && !this.loadMask.enable){
              this.loadMask = new Ext.ux.IntelliMask(ct || this[this.mediaEl],
                   Ext.apply({fixElementForMedia:true, autoHide:4000},this.loadMask));
          }

      },

       /** @private */
      doAutoLoad  : function(){
          this.chartAutoLoad (
           typeof this.autoLoad === 'object' ?
               this.autoLoad : {url: this.autoLoad});
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

       /** @private  this function is designed to be used when a chart object notifies the browser
        * if its initialization state.  Raised Asynchronously.
        */
       onFlashInit  :  function(id){
           chart.FlashAdapter.superclass.onFlashInit.apply(this,arguments);
           this.fireEvent.defer(1,this,['chartload',this, this.getInterface()]);
       },

       loadMask : false

    });


    /** @private  Class method callbacks */
    chart.FlashAdapter.chartOnLoad = function(DOMId){

        var c, d = Ext.get(DOMId);
        if(d && (c = d.ownerCt)){
            c.onChartLoaded.call( c);
            c = d=null;
            return false;
        }
        d= null;
    };

    /** @private  Class method callbacks */
    chart.FlashAdapter.chartOnRender = function(DOMId){
        var c, d = Ext.get(DOMId);
        if(d && (c = d.ownerCt)){
            c.onChartRendered.call( c);
            c = d = null;
            return false;
        }
        d= null;
    };
})();