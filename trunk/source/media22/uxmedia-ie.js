/**
  @desc Additional ux.Media.mediaTypes for IE only
*/

   Ext.isIE && 
    Ext.ux.Media && 
      Ext.apply(Ext.ux.Media.mediaTypes, {
        
         /**
         * @namespace Ext.ux.Media.mediaTypes.DATAVIEW
         */

        DATAVIEW : {
              tag      : 'object'
             ,cls      : 'x-media x-media-dataview'
             ,classid  : 'CLSID:0ECD9B64-23AA-11D0-B351-00A0C9055D8E'
             ,type     : 'application/x-oleobject'
             ,unsupportedText: 'MS Dataview Control is not installed'

        },
        /**
         * @namespace Ext.ux.Media.mediaTypes.OWCXLS
         */

        OWCXLS : {    
              tag      : 'object'
             ,cls      : 'x-media x-media-xls'
             ,type      :"application/vnd.ms-excel"
             ,controltype: "excel"
             ,params  : { DataType : "CSVURL"
                        ,CSVURL : '@url'
                        ,DisplayTitleBar : true
                        ,AutoFit         : true
                     }
             ,codebase: "file:msowc.cab"
             ,classid :"CLSID:0002E510-0000-0000-C000-000000000046" //owc9
           //,classid :"CLSID:0002E550-0000-0000-C000-000000000046" //owc10
           //,classid :"CLSID:0002E559-0000-0000-C000-000000000046" //owc11

         },

        /**
         * @namespace Ext.ux.Media.mediaTypes.OWCCHART
         */

        OWCCHART : {    
              tag      : 'object'
             ,cls      : 'x-media x-media-xls'
             ,type      :"application/vnd.ms-excel"
             ,data     : "@url"
             ,classid :"CLSID:0002E500-0000-0000-C000-000000000046" //owc9
            //,classid :"CLSID:0002E556-0000-0000-C000-000000000046" //owc10
            //,classid :"CLSID:0002E55D-0000-0000-C000-000000000046" //owc11
             ,params  : { DataType : "CSVURL" }
           },

        /**
         * @namespace Ext.ux.Media.mediaTypes.OFFICE
         */

        OFFICE : {
              tag      : 'object'
             ,cls      : 'x-media x-media-office'
             ,type      :"application/x-msoffice"
             ,data     : "@url"
        },
        
        /**
         * @namespace Ext.ux.Media.mediaTypes.POWERPOINT
         */

        POWERPOINT : {     //experimental
              tag      : 'object'
             ,cls      : 'x-media x-media-ppt'
             ,type     :"application/vnd.ms-powerpoint"
             ,file     : "@url"
             ,classid :"CLSID:EFBD14F0-6BFB-11CF-9177-00805F8813FF"
             },
                     
	    /**
	     * @namespace Ext.ux.Media.mediaTypes.VISIO
	     * Visio Viewer 2007
	     * Server registration for mime-types:
	     * .VSD, .VSS, .VST, .VDX, .VSX, .VTX extensions
	     *    should register Content-type: application/vnd.ms-visio.viewer
	     */
	    VISIO : { tag      : 'object'
	             ,cls      : 'x-media x-media-vsd'
	             ,classid  : "CLSID:279D6C9A-652E-4833-BEFC-312CA8887857" 
	             ,codebase : "http" + ((Ext.isSecure) ? 's' : '') + "://www.microsoft.com/downloads/info.aspx?na=90&p=&SrcDisplayLang=en&SrcCategoryId=&SrcFamilyId=d88e4542-b174-4198-ae31-6884e9edd524&u=http%3a%2f%2fdownload.microsoft.com%2fdownload%2f6%2ff%2f5%2f6f569198-e7d0-49af-b162-54a11f38d301%2fvisioviewer.exe"
	             ,type     : 'application/vnd.ms-visio.viewer'
	             ,autoSize : true
	             ,params  : {
	                  SRC          : '@url'
	                 ,BackColor    : '16777200'
	                 ,ContextMenuEnabled  : 1
	                 ,GridVisible   : 0
	                 ,AlertsEnabled : 1
	                 ,HighQualityRender:  1
	                 ,PageColor     : '16777215'
	                 ,PageVisible   : 1
	                 ,PropertyDialogEnabled : 1
	                 ,ScrollbarsVisible     : 1
	                 ,SizeGripVisible       : 1
	                 ,ToolbarVisible        : 1
	                 ,CurrentPageIndex      : 0
	                 ,Zoom                  : -1
	                 ,PageTabsVisible       : 1
	                 ,ToolbarButtons        :'About,Sep,ZoomIn,ZoomOut,ZoomWidth,ZoomPage,Zoom100,Zoom,Sep,OpenInVisio,Sep,Props,Layers,Reviewing,Sep,Help'
	                 ,ToolbarCustomizable   : 1 
	              }
	           },
               
        /**
         * @namespace Ext.ux.Media.mediaTypes.RDP
         * Remote Desktop Client Plugin
         */

         RDP : {
              tag      : 'object'
             ,cls      : 'x-media x-media-rdp'
             ,type     : "application/rds"
             ,unsupportedText: "Remote Desktop Web Connection ActiveX control is required. <a target=\"_msd\" href=\"http://go.microsoft.com/fwlink/?linkid=44333\">Download it here</a>."
             ,params:{
                  Server         : '@url'
                 ,Fullscreen     : false
                 ,StartConnected : false
                 ,DesktopWidth   : '@width'
                 ,DesktopHeight  : '@height'
             }
             ,classid :"CLSID:9059f30f-4eb1-4bd2-9fdc-36f43a218f4a"
            ,CODEBASE :"msrdp.cab#version=5,2,3790,0"
          }
    });