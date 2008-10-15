/*
 * Author: Doug Hendricks. doug[always-At]theactivegroup.com
 * Copyright 2007-2008, Active Group, Inc.  All rights reserved.
 *
 ************************************************************************************
 *   This file is distributed on an AS IS BASIS WITHOUT ANY WARRANTY;
 *   without even the implied warranty of MERCHANTABILITY or
 *   FITNESS FOR A PARTICULAR PURPOSE.
 ************************************************************************************
*/


var supr = Ext.Element.prototype;
Ext.override(Ext.Layer, {
    hideAction : function(){
        this.visible = false;
        if(this.useDisplay === true){
            this.setDisplayed(false);
        }else{
            supr.setLeftTop.call(this, -10000, -10000);
        }
    }
});
Ext.override(Ext.Panel,
{
   onShow: function()
   {
      if (this.floating)
      {
         this.el.lastLT = this.lastLT;
         this.el.show();
         delete this.el.lastLT
      }
      else
         Ext.Panel.superclass.onShow.call(this);
   },

   onHide: function()
   {
      if (this.floating)
      {
         this.lastLT = [this.el.getLeft(), this.el.getTop()];
         this.el.hide();
      }
      else
         Ext.Panel.superclass.onHide.call(this);
   }
}
);

//Ext syntax sugar and FB console emulation
    if(typeof console == 'undefined'){
        console = {
        log: Ext.debug?Ext.log:alert,
        dir: Ext.debug?Ext.dump:alert,
        info: Ext.debug?Ext.log:alert,
        warn: Ext.debug?Ext.log:alert
        };
      }

    Ext.apply(window,{
        $ : Ext.get
       ,$A: Ext.value
       ,$C : Ext.getCmp
       ,$D : Ext.getDom
       ,$$ : Ext.select
       ,$Q : Ext.query
       ,$on: Ext.EventManager.on
       ,$ready : Ext.onReady
       ,$l : console.log
       ,$cd: console.dir
       ,$for : typeof forEach != 'undefined'? forEach : Ext.each

    });


//'Plugins unavailable' shortcuts
var not = {

     QT : 'Get QuickTime: <a href="http://www.apple.com/quicktime/download" target="_fdownload">Here</a>'
    ,FLASH: {tag:'span',cls:'noJoy'
              ,html:'<p>Note: The Ext.MediaPanel Demo requires Flash Player 8.0 or higher. The latest version of Flash Player is available at the <a href="http://www.adobe.com/go/getflashplayer" target="_fdownload">Adobe Flash Player Download Center</a>.</p>'
            }
    ,FLASHV:{tag:'span',html:'<p>Note: The Ext.MediaPanel Demo requires Flash Player {0} or higher. The latest version of Flash Player is available at the <a href="http://www.adobe.com/go/getflashplayer" target="_fdownload">Adobe Flash Player Download Center</a>.</p>'}
    ,PDF   : 'Get Acrobat Reader: <a href="http://www.adobe.com/products/acrobat/readstep2.html" target="_fdownload">Here</a>'
    ,REAL  : 'Get RealPlayer Plugin: <a href="http://www.realplayer.com/" target="_fdownload">Here</a>'
    ,OWC   : 'Office Web Controls are not available.'
    ,JWP   : '<p>FLV Player can handle (FLV, but also MP3, H264, SWF, JPG, PNG and GIF). It also supports RTMP and HTTP (Lighttpd) streaming, RSS, XSPF and ASX playlists, a wide range of flashvars (variables), an extensive  javascript API and accessibility features.</p>'+
             'Get FLV Player <a href="http://www.jeroenwijering.com/?item=JW_FLV_Player" target="_fdownload">Here</a>.'
    ,JWROT  :'The JW Image Rotator (built with Adobe\'s Flash) enables you to show photos in sequence, with fluid transitions between them. It supports rotation of an RSS, XSPF or ASX playlists with JPG, GIF and PNG images.'+
              '<p>Get JW ImageRotator <a href="http://www.jeroenwijering.com/?item=JW_Image_Rotator" target="_fdownload">Here</a>.'
};

//YouTube Global ready handler
var onYouTubePlayerReady = function(playerId) {
     //Search for a ux.Flash-managed player.
     var mediaComp, el = Ext.get(playerId);
     if(mediaComp = (el?el.ownerCt:null)){
          mediaComp.onFlashInit();
     }

};

//JWV Global ready handler
var playerReady= function(obj) {
         //Search for a ux.Flash-managed player.
    var mediaComp, el = Ext.get(obj['id']);
    if(mediaComp = (el?el.ownerCt:null)){
         mediaComp.onFlashInit();
    }
};
var JWPtrace = function(){console.log(arguments);};

var sampleNodes = [
   {'text':'Video'
    ,'id':'\/video'
    ,'leaf':false
    ,iconCls:'folder'
    ,expanded:true
    ,children: [
            {
             text:'Flash(Win)'
            ,id:'\/video\/flash'
            ,leaf:true
            ,tabTitle:'Fire vs Police'
            ,mediaClass :'flashpanel'
            ,winClass: 'FlashWindow'
            ,handler    : 'winView'
            ,winCfg     : {
                _cls:'FlashWindow',
                height:355,
                width: 425
                ,mediaMask:true
                ,listeners  : {
                    flashinit : function(panel,player){
                        panel.setTitle('YouTube Reports Ready');
                        player.playVideo(); }
                     }
                }
            ,config:{
                 mediaType:'SWF'
                ,url:'http://www.youtube.com/v/Jr8n0ww3pio&hl=en&fs=1'
                ,autoSize:true
                ,height : 355
                ,width  : 425
                ,id:'youtube'
                ,controls:true
                ,start:false
                ,loop :false
                ,unsupportedText : not['FLASH']
                ,params:{
                      wmode:'opaque'
                     ,allowscriptaccess : 'always'
                     ,allowfullscreen  : true
                     ,flashVars:{
                          enablejsapi : 1
                         ,playerapiid:'@id'
                         ,fs:1
                      }
                }

                }
             }
            ,{
            text:'Quicktime'
            ,id:'\/video\/qmov'
            ,leaf:true
            ,config:{ mediaType:'QT'
                ,url:'http://www.sarahsnotecards.com/catalunyalive/diables.mov'
                ,width:425
                ,height:355
                ,id    :'qtimemov'
                ,unsupportedText : not['QT']
                ,controls:true
                ,start:true
                ,volume  : 10
                ,scale : 'ToFit'
                ,params:{
                    QTSRC : '@url',
                    QTSRCDontUseBrowser: true,
                    src : null  //disable browser download
                 }
                }
              }
            ,{
            text:'Quicktime VR'
            ,id:'\/video\/qmovvr'
            ,leaf:true
            ,config:{ mediaType:'QT'
                ,url:'http://www.edb.utexas.edu/teachnet/QTVR/Movies/UT-Wash.mov'
                ,autoSize : true
                ,id    :'qtimeVR'
                ,unsupportedText : not['QT']
                ,start:true
                ,volume  : 10
                ,scale : 'tofit'
                ,params:{
                    cache : true
                    ,QTSRCDontUseBrowser: true
                 }
                }
              }
            ,{
            text:'Real Video'
            ,id:'\/video\/realv'
            ,leaf:true
            ,tabTitle:'Real One'
            ,config:{
                      mediaType:'REAL'
                     ,url       :'http://www.exploittheweb.co.uk/videotest.rm'
                     ,height    :'100%'
                     ,width     :'100%'
                     ,unsupportedText : not['REAL']
                     //,controls:'ImageWindow'
                     ,start:true}
          }
        ,{
            text:'Windows Media'
            ,id:'\/video\/wmedia'
            ,leaf:true
            ,handler    : 'winView'
            ,winCfg     : {_cls:'MediaWindow',height:300, width: 250, mediaMask:{msg:'Loading Movie...',autoHide:3000}}
            ,config:{
                 mediaType  :'WMV'
                ,url        :'http://www.sarahsnotecards.com/catalunyalive/fishstore.wmv'
                ,autoSize : true
                ,id         :'wmv'
                ,unsupportedText : not['WMV']
                ,controls   :true
                ,start      :true
                ,status     :true
                ,params: {
                    stretchToFit : true

                  }
                }
          },
          {
              text:'VLC Player'
              ,id:'\/video\/vlc'
              ,leaf:true
              ,handler    : 'winView'
              ,winCfg     : {_cls:'MediaWindow',height:300, width: 600, mediaMask:{msg:'Loading Player...',autoHide:3000}}
              ,config:{
                   mediaType  :'VLC'
                  ,url        :'http://images.apple.com/movies/wb/i_am_legend/i_am_legend-tlr1_h.480.mov'
                  ,autoSize : true
                  ,id         :'vlcp'
                  ,unsupportedText : not['VLC']
                  ,controls   :true
                  ,start      :true
                  }
          }
        ]
    }
  ,
  {
       text     :'Audio'
      ,id       :'\/audio'
      ,leaf     :false
      ,iconCls  :'folder'
      ,expanded :true
      ,children : [
            {
             text   :'QuickTime MP3 (w/Loop)'
            ,id     :'\/audio\/sit'
            ,leaf   :true
            /* This QT config should play most any registered media class it support */
            ,config:{
                      mediaType :'QT'
                     ,url       :'sit.mp3'
                     ,start     :true
                     ,controls  :true
                     ,scripting:true

                     ,loop      :true
                     ,unsupportedText : not['QT']
                     ,height    :44
                     ,width     :280

                     }
            }
            ,{
             text   :'QuickTime Midi'
            ,id     :'\/audio\/canyon'
            ,leaf   :true
            ,config:{ mediaType     :'QT'
                     ,url           :'canyon.mid'
                     ,start         :true
                     ,controls      :true
                     ,volume        :'30%'
                     ,unsupportedText : not['QT']
                     ,height        :44
                     ,width         :280
                     }
            }
          ,{
               text     :'QuickTime WAV'
              ,id       :'\/audio\/ring'
              ,leaf     :true
              ,config:{ mediaType   :'QT'
                       ,url         :'callring.wav'
                       ,start       :true
                       ,controls    :true
                       ,unsupportedText : not['QT']
                       ,height      :44
                       ,width       :280
                       }
            }
            ,{
               text     :'WordPress MP3'
              ,id       :'\/audio\/wordpress'
              ,leaf     :true
              ,mediaClass :'flashpanel'
              ,config:{
                        mediaType:'WPMP3'
                       ,url         :'player.swf'
                       ,start       :'yes'
                       ,controls    : 'yes'
                       ,loop        : 'no'
                       ,volume     : 20

                       ,height      :44
                       ,width       :280
                       ,boundExternals : ['open','close','setVolume','load']
                       ,params : {
                            wmode:'transparent'
                           ,allowscriptaccess : 'always'
                           ,flashVars : {
                               scale        :'@scale'
                              ,autostart    : "@start"
                              ,controller   : "@controls"
                              ,enablejavascript : "@scripting"
                              ,loop         :'@loop'
                              ,transparentbg:'yes'
                              ,animation    : 'no'
                              ,initialvolume:'@volume'
                              ,width        :'@width'  //required
                              ,encode       : 'no' //mp3 urls will noy be encoded
                              ,soundFile    : 'sit.mp3'   //required
                           }
                        }
                      }
            }

        ]

    },
    {
       text:'Documents'
      ,id:'\/docs'
      ,leaf:false
      ,iconCls:'folder'
      ,expanded:true
      ,children: [
         {
           text:'Acrobat(Win)'
          ,id:'\/docs\/pdf'
          ,leaf:true
          ,handler    : 'winView'
          ,winCfg     : {
              height:600,
              width: 400,
              mediaMask: false,
              autoScroll : false
            }
          ,config:{ mediaType   :'PDF'
             //See http://partners.adobe.com/public/developer/en/acrobat/PDFOpenParameters.pdf for OpenPDF param options
                   ,url         :'ex1.pdf#page=2&zoom=50&pagemode=none'
                   ,id          :'ex1pdf'
                   ,unsupportedText : not['PDF']

             }
          },
          {
             text:'Acrobat(Win-iframe)'
            ,id:'\/docs\/framepdf'
            ,leaf:true
            ,handler    : 'winView'
            ,winCfg     : {
                height:600,
                width: 400,
                //mediaMask: false,
                autoScroll : false
              }
            ,config:{ mediaType   :'PDFFRAME'
               //See http://partners.adobe.com/public/developer/en/acrobat/PDFOpenParameters.pdf for OpenPDF param options
                     ,url         :'ex1.pdf#page=2&zoom=50&pagemode=none'
                     ,id          :'frameex1pdf'
                     ,unsupportedText : not['PDF']

                       }
          }
        ,{
           text     :'HTML'
          ,id       :'\/docs\/html'
          ,width    :'100%'
          ,height   :'100%'
          ,leaf     :true
          ,config   :{ mediaType:'HTM'
                      ,url      :'http://www.extjs.com/'
                      ,id       :'bextjs'

                     }
          }
         ,{
            text:'OWC-Excel(IE)'
           ,id:'\/docs\/excel'
           ,leaf:true
           ,config:{ mediaType  :'OWC:XLS'
                    ,url        :'getData.asp'
                    ,unsupportedText : not['OWC']
                    ,id         :'xlspricing'
                    ,params: {
                        HTMLUrl  : null
                       ,CSVURL   : '@url'
                       ,DataType : "CSVURL"
                       ,AutoFit  : true
                       ,DisplayColHeaders :true
                       ,DisplayGridlines : true
                       ,DisplayHorizontalScrollBar : true
                       ,DisplayRowHeaders : true
                       ,DisplayTitleBar: true
                       ,DisplayToolbar:true
                       ,DisplayVerticalScrollBar:true
                       ,EnableAutoCalculate:true
                       ,EnableEvents:true
                       ,MoveAfterReturn:true
                       ,MoveAfterReturnDirection: false
                       ,RightToLeft : 0
                       ,ViewableRange :"A1:I30"

                     }
                 }
          }
          ,{
          text:'Dataview'
         ,id:'\/docs\/Dataview'
         ,leaf:true
         ,config:{ mediaType  :'DATAVIEW'
                  ,url        :'data:'
                  ,id         :'dataview'}
          }
       ]

    }
   ,
   {
      text  :'Images'
     ,id    :'\/image'
     ,leaf  :false
     ,iconCls:'folder'
     ,expanded:true
     ,children: [
        {
          text  :'Jpeg'
         ,id    :'\/image\/boat'
         ,leaf  :true
         ,mediaClass :'mediawindow'
         ,winClass: 'MediaWindow'
         ,tabTitle: 'Boating Accidents Happen'
         ,handler    : 'winView'
         ,winCfg     : {
                x : 100,
                y: 100,
                resizable : false,
                shadow   :  true,
                mediaMask: false,
                autoHeight : true,
                autoWidth : !Ext.isIE,
                width : 480,
                constrainHeader : false,
                constrain : false,
                autoScroll : true

              }
         ,config:{ mediaType    :'JPEG'
                  ,url          :'how boating accidents happen.jpg'
                  ,id           :'accidents'
                  ,style        :{position:'relative'}
                  ,autoSize  : false

               }
         }
      ]
    }
    ,{
       text     :'Advanced Flash Class'
      ,id       :'\/cflash'
      ,leaf     :false
      ,iconCls  :'folder'
      ,expanded :true
      ,children : [
         {   text       :'YouTube(again)'
            ,id         :'\/cflash\/cutube'
            ,leaf       :true
            ,mediaClass :'flashpanel'
            ,tabTitle   : 'Flash Detection'
            ,listeners  : { render : function(panel){
                             var version = panel.detectVersion();
                             if(version){
                                Ext.DomHelper.append(panel.body,
                                  {tag:'p',html: 'Flash Version ' + version + ' detected.'});
                             }
                           }
                           ,single:true
                        }
            ,config:{
                 url:'http://www.youtube.com/v/Jr8n0ww3pio&hl=en&fs=1'
                ,width      :425
                ,height     :355
                ,controls   :true
                ,start      :false
                ,unsupportedText : not['FLASHV']
                ,installUrl:'playerProductInstall.swf'
                ,requiredVersion : '9.0.45'
                ,params:{
                    wmode:'opaque',
                    allowFullScreen : true
                    }

                }
         }
        ,{   text       :'w\/Express Install'
            ,id         :'\/cflash\/cexpress'
            ,leaf       :true
            ,mediaClass :'flashpanel'
            ,listeners  : { render : function(panel){
                             var version = panel.detectVersion();
                             if(version){
                                Ext.DomHelper.append(panel.body,
                                  {tag:'p',html: 'Flash Version ' + version + ' detected, but Version '+(panel.requiredVersion||panel.mediaCfg.requiredVersion)+' is required.'});
                             }
                           }
                           ,single:true
                        }
            ,config:{
                 url:'http://www.youtube.com/v/Jr8n0ww3pio&hl=en&fs=1'
                ,width      :425
                ,height     :355
                ,controls   :false
                ,start      : false
                ,unsupportedText : not['FLASHV']
                ,installUrl :'playerProductInstall.swf' //No Express install without specifying this
                ,requiredVersion : '9.0.300'  //a bogus version forces Update
                ,params     :{ scale     :'exactfit'
                              ,salign    :'t'}

                }
         },
         {   text  :'fscommand'
                     ,id         :'\/cflash\/fscommand'
                     ,leaf       :true
                     ,mediaClass :'flashpanel'
                     ,tabTitle   : 'fscommand'
                     ,listeners  : {
                         fscommand : function(panel,command,args){

                              Ext.DomHelper.append(panel.body,
                                {tag:'p',html: 'fscommand received from ' +panel.mediaObject.id + ', command:' +command + ', args:'+args +
                              //Echo it back
                              ', echoing back:' + panel.setVariable('JStoASviaSetVariable','echo:'+args)
                              });
                         }

                     }
                     ,config:{
                          url        :'test.swf'
                         ,width      :300
                         ,height     :120
                         ,id         :'fscTest'
                         ,controls   :true
                         ,scripting  :'always'
                         ,start      :true
                         ,unsupportedText : not['FLASHV']
                         ,params:{
                            wmode:'opaque',
                            bgcolor : '#333',
                            swliveconnect:true}

                         }
         }
         ]

    },
    {     // Reference : http://code.jeroenwijering.com/trac/wiki/FlashAPI
           text     :'JW Players/Viewers'
          ,id       :'\/JW'
          ,leaf     :false
          ,iconCls  :'folder'
          ,expanded :true
          ,children : [
            {   text       :'JW Media Player Banner'
                ,id         :'\/JW\/flvbanner'
                ,leaf       :true
                ,handler    : 'winView'
                ,winCfg     : {
                    _cls:'FlashWindow',
                    height:340,
                    width: 410,
                    autoMask : true,  //set true here because this player provides feedback when ready
                    listeners:{

                        mediaload: function(C, player){
                            //construct a status callback for this instance
                            var cbName = 'recorder_'+player.id;
                            window[cbName] = function(state){this.setTitle(state.newstate);}.createDelegate(C);
                            C.setTitle('JWPlayer 4.1 Reports Ready: '+player.id);

                            //Using Flash ExternalInterface (boundExternals)
                            with(C){
                               addModelListener("STATE",cbName);
                               sendEvent('PLAY','true');
                            }
                        },delay : 100
                    }
                 }
                ,tabTitle   : 'LongTail (JWPlayer 4.1)'
                ,config:{
                    mediaType  : 'JWP'
                    ,url        : 'JWplayer.swf'
                    ,autoSize   : true
                    ,volume     : 25
                    ,start      :false
                    ,loop       :false
                    ,scripting  :'always'
                    //ExternalInterface bindings
                    ,boundExternals : ['sendEvent' , 'addModelListener', 'addControllerListener', 'addViewListener', 'getConfig', 'getPlaylist']
                    ,params:{
                              wmode    :'opaque'
                             ,allowfullscreen   : true
                             ,swliveconnect  : true
                             ,flashVars: {
                                 play       :'@start'
                                ,file       :'http://content.bitsontherun.com/videos/6AJT5nbx.m4v'
                                ,duration   : 30
                                ,stretching :'fill'
                                ,fullscreen : true
                                ,volume     :'@volume'
                             // ,tracecall  : 'JWPtrace' //debug aid
                              }

                            }
                   }
            },
           {    text       :'JW ImageRotator (via Flickr)(Win)'
               ,id         :'\/JW\/ImgRotation'
               ,leaf       :true
               ,mediaClass :'flashpanel'
               ,items      : [{title:'About JW ImageRotator',html:not['JWROT'],border:false}]
               ,tabTitle   : 'JW-FlikrCasting'
               ,winCfg     : {_cls  :'FlashWindow',
                              height:400,
                              width: 400,
                              autoMask : true,
                              mediaMask : {autoHide:5000, msg:'5-Second autoHide Mask'}
                              }
               ,handler    : 'winView'
               ,config:{
                    mediaType   : 'JWP'
                   ,url         : 'http://www.jeroenwijering.com/embed/imagerotator.swf'
                   ,start       : true
                   ,controls    :true

                   ,autoSize  : true
                   ,renderOnResize : true
                   ,unsupportedText : 'JW ImageRotator is not installed/available.'
                   ,params:{
                        wmode               :'transparent'
                       ,allowscriptaccess   : 'always'
                       ,allowfullscreen     : true
                       ,quality             : 'high'
                       ,salign              :'tl'

                       ,flashVars:{
                           width      :'@width'
                          ,height     :'@height'
                          ,file       :'http://api.flickr.com/services/feeds/photos_public.gne?tags=macro&format=rss_200'
                          ,shownavigation:true
                          ,transition : 'random'
                          ,lightcolor: 0x990066
                          ,stretching :'fill'
                          ,autostart  :'@start'
                         }

                      }
                 }
            }
          ]
    },{
      text  :'Other'
     ,id    :'\/other'
     ,leaf  :false
     ,iconCls:'folder'
     ,expanded:true
     ,children: [
        {
          text  :'Remote Desktop Client (IE)'
         ,id    :'\/other\/rds'
         ,leaf  :true

         ,listeners:{

                 mediarender: function(C, RDC){

                    if(typeof RDC.dom.AdvancedSettings2 == 'undefined')return;  //may not be installed

                     RDC.setVisibilityMode('x-hide-nosize');
                     RDC.hide(); //hide the ActiveX object so the prompt shows

                     Ext.Msg.prompt(
                         'Remote Desktop Login',
                         'Enter Remote Desktop (or TermServer) address',
                         function(button, value){
                            this.show(); //show it again
                            if(button == 'ok' && !!value){

                                 with(this.dom.AdvancedSettings2){
                                    RedirectDrives = false;
                                    RedirectPrinters = false;
                                    SmartSizing = true;
                                    KeepAliveInterval = 300000; //5 minutes
                                    EnableAutoReconnect = true;
                                 }
                                 with(this.dom){
                                     Server = value;
                                     DesktopWidth = 800;
                                     DesktopHeight = 600;
                                     Connect();
                                 }


                            } else {
                                this.ownerCt.ownerCt.remove(this.ownerCt); //remove from the tabPanel
                            }
                         },
                         RDC);
                  }
              }

         ,config:{ mediaType    :'RDP'
                  ,url          : null
                  ,id           :'rdesktop'
               }
         }
      ]
    }
 ];

var Demo = {

    init    : function(){

        var get = Ext.getCmp;

        this.tree = get('samples');
        this.tabs = get('demoTabs');
        var sm = this.tree.getSelectionModel();

        this.tree.on('click', this.handlers.nodeSelect.createDelegate(this,[sm],0));
        },
    destroy  : function(){
        Ext.destroy(Ext.getCmp('viewWin'),Demo.view )

    },

    handlers:{
           nodeSelect:function( smodel, treeNode, e ){

                    //A folder or already selected
                    if(!treeNode.isLeaf()) {return false;}

                    var NA = treeNode.attributes || {};

                    if(NA.handler){

                        (Demo.handlers[NA.handler]?Demo.handlers[NA.handler]:NA.handler)(NA,treeNode.ui.anchor,NA.winClass);
                        return;
                    }
                    var id = NA.id.split('\/')[2] || false; //derive a tab id from node.id

                    var tab;
                    if(tab = this.tabs.getItem(id)){
                        tab.refreshMedia();    //force media Refresh
                    } else {
                        tab = this.tabs.add(
                                 {
                                    xtype   : NA.mediaClass || 'mediapanel'
                                   ,id      : id || (id=Ext.id())
                                   ,hideMode:'nosize'
                                   ,mediaMask : {autoHide:Ext.isIE?false:2000, zIndex:8500} //adjust Z to appear under an Ext.Window
                                   ,mediaCfg: NA.config
                                   ,title   : NA.tabTitle || NA.text || id
                                   ,listeners: Ext.apply({
                                       //mediarender:function(p,o){console.log(['mediarender',p,o]);}
                                     },NA.listeners || false)
                                   ,items   : NA.items || []
                                  });
                        this.tabs.doLayout();


                    }
                    this.tabs.setActiveTab(tab);
            },

            /* MediaWindow Handler */
            winView   : function(NA,animTarget){
                var winClass = (NA.winCfg?NA.winCfg._cls:null) || 'MediaWindow';
                vwin = Ext.getCmp('viewWin');

                if(vwin){
                    vwin.close();
                    vwin=null;
                }
                var mConfig = Ext.apply({},NA.config);

                vwin = new Ext.ux[winClass]
                           (Ext.apply(
                                {id         :'viewWin'
                                ,height     : NA.winCfg.autoHeight? null : 430
                                ,width      : NA.winCfg.autoWidth? null :430
                                ,mediaMask  : {autoHide : 2000}  //default 2 second auto-hide mask
                                ,minHeight  : (parseInt(mConfig.height,10)||0)+32
                                ,collapsible: true
                                ,constrain : true
                                ,renderTo   : Ext.getBody()
                                ,title      : (NA.tabTitle || NA.text || "Who knows?")
                                ,mediaCfg   : mConfig
                                ,listeners  : NA.listeners || false
                                ,tools: [{id:'gear',handler:function(e,t,p){p.renderMedia();},
                                        qtip: {text:'Refresh the Media'}}]
                            }
                            ,NA.winCfg || {})
                            );
                            vwin.show();

            }
    }
};

//Ext.useShims = true;
Ext.BLANK_IMAGE_URL = '../../resources/images/default/s.gif';
Ext.onReady(function(){
   Ext.QuickTips.init();
   Ext.QuickTips.getQuickTip().interceptTitles = true;

   Ext.QuickTips.enable();

   Demo.view = new Ext.Viewport({
        layout:'border',

        listeners:{ render: Demo.init,
                    scope : Demo,
                    single : true},
        items:[
            new Ext.BoxComponent({ // raw element
                region:'north',
                el: 'header',
                height:32
            }),
            {
                region:'west',
                id:'demos',
                title:'Demos and Notes',

                split:true,
                width:200,
                minSize: 175,
                maxSize: 400,
                collapsible: true,
                cmargins:'5 5 5 5',
                layout:'accordion',

                //since this region is collapsible, the plugin is required to prevent child media from reinitializing
                plugins: !Ext.isIE ? [new Ext.ux.Media.VisibilityFix({mode:'x-hide-nosize',hideMode:'nosize',element:['bwrap']})] : null,
                hideMode      : !Ext.isIE?'nosize':'display',
                animCollapse  : Ext.isIE,
                animFloat     : Ext.isIE,

                layoutConfig:{
                     animate:false
                    ,activeOnTop : false
                    ,autoWidth: true
                    ,autoHeight: true
                    ,fill:true
                },
                defaults:{autoScroll:true},
                items:[
                    {
                        id:'samples',
                        xtype:'treepanel',
                        autoScroll:true,
                        title: 'Media Showcase',
                        loader: new Ext.tree.TreeLoader(),
                        rootVisible:false,
                        lines:false,

                        root: new Ext.tree.AsyncTreeNode({
                            text:'Online',
                            expanded:true,
                            children:sampleNodes
                        })
                   } ,
                   {
                        title: 'Hit Parade'
                       ,id : 'hits'
                       ,xtype: 'mediapanel'

                       ,mediaCfg:{
                             mediaType:'GIF'
                             ,height:30
                             ,width : '100%'
                            ,url:'speeddial.gif'
                            ,id:'odometer'
                            ,start : true
                        }
                    } ,
                     {
                       title    : 'Clock'
                      ,id       : 'clockPanel'
                      ,xtype    : 'flashpanel'
                      ,autoHeight :  true
                      ,autoWidth: true
                      ,mediaCfg : {
                            mediaType:'SWF'
                            ,url: 'clock.swf'
                            ,id:  'clock'
                            ,start    : true
                            ,loop     : true
                            ,controls :true
                            ,height:130  //fixed height for aspect ratio
                            ,width : '100%'
                            ,params: {
                                wmode     :'transparent'
                               ,scale     :'exactfit'
                               ,salign    :'t'
                            }
                       }
                    }

                ]
             },
             { xtype:'tabpanel'
               ,region:'center'
               ,id    :'demoTabs'
               ,activeTab: 0
               ,split:true

               ,enableTabScroll: true
               ,monitorResize: true

               ,defaults:{
                 closable   :true

                }
               ,items:[{title:'BackGrounder'
                       ,contentEl:'background'
                       ,id : 'BG'
                       ,autoScroll : true
                       ,hideMode : Ext.isIE ? 'display' : 'nosize'
                       }]

            }
    ]
  });

   Ext.EventManager.on(window,   "beforeunload",  Demo.destroy ,Demo,{single:true});

});
