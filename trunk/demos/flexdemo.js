/*
 * Author: Doug Hendricks. doug[always-At]theactivegroup.com
 * Copyright 2009, Active Group, Inc.  All rights reserved.
 *
 ************************************************************************************
 *   This file is distributed on an AS IS BASIS WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 ************************************************************************************
*/


//Highly recommended for use with complex/Flash Ext.Components
Ext.override( Ext.Element , {

  /**
  * Removes this element from the DOM and deletes it from the cache
  * @param {Boolean} cleanse (optional) Perform a cleanse of immediate childNodes as well.
  * @param {Boolean} deep (optional) Perform a deep cleanse of all nested childNodes as well.
  */

  remove : function(cleanse, deep){
      if(this.dom){
        this.removeAllListeners();    //remove any Ext-defined DOM listeners
        if(cleanse){ this.cleanse(true, deep); }
        Ext.removeNode(this.dom);
        this.dom = null;  //clear ANY DOM references
        delete this.dom;
      }
    },

    /**
     * Deep cleansing childNode Removal
     * @param {Boolean} forceReclean (optional) By default the element
     * keeps track if it has been cleansed already so
     * you can call this over and over. However, if you update the element and
     * need to force a reclean, you can pass true.
     * @param {Boolean} deep (optional) Perform a deep cleanse of all childNodes as well.
     */
    cleanse : function(forceReclean, deep){
        if(this.isCleansed && forceReclean !== true){
            return this;
        }

        var d = this.dom, n = d.firstChild, nx;
         while(d && n){
             nx = n.nextSibling;
             if(deep){
                     Ext.fly(n).cleanse(forceReclean, deep);
                     }
             Ext.removeNode(n);
             n = nx;
         }
         this.isCleansed = true;
         return this;
     }
});

Ext.removeNode =  Ext.isIE ? function(n){

            if(n && n.tagName != 'BODY'){
                    var d = document.createElement('div');
                    d.appendChild(n);
                    //d.innerHTML = '';  //either works equally well
                    d.removeChild(n);
                    delete Ext.Element.cache[n.id];  //clear out any Ext reference from the Elcache
                    d = null;  //just dump the scratch DIV reference here.
            }

        } :
        function(n){
            if(n && n.parentNode && n.tagName != 'BODY'){
                n.parentNode.removeChild(n);
                delete Ext.Element.cache[n.id];
            }
        };

Ext.BLANK_IMAGE_URL = '../../resources/images/default/s.gif';
var flexWin; 
Ext.onReady(function(){

    Ext.QuickTips.init();
    Ext.QuickTips.enable();

    flexWin = new Ext.ux.Media.Flex.Window({

            height      : 450,
            width       : 430,
            id          : 'winFlex',
            title       : 'ux.Flex.Window:',
            collapsible : true,
            maximizable : true,
            autoScroll  : true,
            constrainHeader : true,
            tools       : [{
                id:'refresh', 
                handler:function(e,t,p){ 
                    p.getTopToolbar().disable();
                    p.refreshMedia();
                    
                  },
                qtip: {text:'Refresh'}
                }],
            mediaCfg    :{ 
                id   : 'flexapp', //The default bridgeName
                url  : 'flexapp.swf'
             },
            mediaMask  : {msg:'Loading Flex Application Object'},
            autoMask  : true,
            listeners :{
               //The signal that the FABridge bindings are initialized
               flexinit : function(win){
                  this.setTitle(this.title.split(":")[0]+': Flex Bound.');
                  this.getTopToolbar().enable();
                  
                  with(this.getBridge()){
                    button().addEventListener("click",this.onButton.createDelegate(this));
                    slider().addEventListener("change",this.onSlide.createDelegate(this));
                  }
               },
               render: function(){
                    this.lastEventEl = this.getTopToolbar().items.last();
                    this.getTopToolbar().disable();
               }
            },
            onButton : function(e){
                this.lastEventEl && this.lastEventEl.setText('Button: '+ e.type());
            },
            onSlide : function(e){
                e.value && this.lastEventEl &&  
                    this.lastEventEl.setText('Slider: ' + e.type() + " : " + e.value());
                
            },
            onGridRow : function(e){
                this.lastEventEl &&  
                    this.lastEventEl.setText("apples: " + e.target().selectedItem().apples);
                    
            },
            initComponent : function(){
                
	            this.tbar = [ 
                    {
                       text : 'Say Hello',
                       handler : function(_tbutton){
                            with (this.getBridge()) {
                              testFunc( "Hello, Actionscript! Ext is here." );
                            }
                       },
                       scope : this
                    },
	                {
	                   text : 'Toggle ChkBox',
                       enableToggle : true,
                       pressed : false,
                       handler : function(_tbutton){
	                        with (this.getBridge()) {
	                          check().setSelected(_tbutton.pressed);
	                        }
                       },
                       scope : this
	                },
	                {id: 'addChart', 
	                 text : 'Add a Chart',
	                 handler : function(){
                       var M = this.mediaObject; 
                       if(M)
                        with (this.getBridge()) {
   						    var chart = M.createObject("mx.charts.ColumnChart");
                            chart.setName("chart");
							var s1 = M.createObject("mx.charts.series.ColumnSeries");
							s1.setYField("apples");
							var s2 = M.createObject("mx.charts.series.ColumnSeries");
							s2.setYField("oranges");
							chart.setSeries( [s1, s2] );
							chart.setWidth(300);
							chart.setHeight(200);
							panel().addChild(chart);
							//Generate a sample data series
							var dp = [];
							for(var i=0;i<20;i++) {
							  dp.push( {apples: Math.random()*100, oranges: Math.random()*100} );
							}
                            chart.setDataProvider(dp);
						}
	                 },
                     scope : this
	                },
	                {id: 'addGrid', 
	                 text : 'Add a Grid',
	                 handler : function(){
                        var M = this.mediaObject;
                        if(M)
                        with (this.getBridge()) {
							var grid = M.createObject("mx.controls.DataGrid");
							var col1 = M.createObject("mx.controls.dataGridClasses.DataGridColumn");
							col1.setDataField("apples");
							var col2 = M.createObject("mx.controls.dataGridClasses.DataGridColumn");
							col2.setDataField("oranges");
							grid.setColumns( [col1, col2] );
							grid.setWidth(300)
							grid.setDataProvider([ 
							    { apples: 12, oranges: 32 }, 
							    { apples: 7, oranges: 47 }, 
							    { apples: 14, oranges:21 } 
							  ]);
							panel().addChild(grid);
                            grid.addEventListener("change", this.onGridRow.createDelegate(this) );
                        }

	                 },
                     scope : this
	                },
                    '->',
	                {id: 'lastEvent', 
	                 width : 200,
	                 text:'waiting...'
	                }];
                    
                 Ext.ux.Media.Flex.Window.prototype.initComponent.call(this);    
            }
            
    });

    flexWin.show();
  
    Ext.EventManager.on(window,   "beforeunload",  function(){ Ext.destroy(flexWin);},
      {single:true});

});
