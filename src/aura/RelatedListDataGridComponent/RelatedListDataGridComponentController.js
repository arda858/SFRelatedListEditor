({
    doInit : function(component, event, helper) {  
        //If the component is initialized 
        //From the related lists component
        //We have just to load items
        if(component.get("v.relatedObjectName")!=""){
            helper.loadItems(component);                      
        }
        
        //Otherwise we have to load 
        //the metadata as well
        else{
            console.log("else")
            if(component.get("v.relatedListLabel")){
                var metadataAction = component.get("c.getRelatedListMetadata");
                
                
                var recordId = component.get("v.recordId");
                var relatedListLabel = component.get("v.relatedListLabel") ;
                
                if(relatedListLabel.includes(":")){
                    recordId = component.get("v.simpleRecord.AccountId");
                    relatedListLabel = relatedListLabel.split(":")[1];
                }
                
                console.log(recordId+" "+relatedListLabel)
                metadataAction.setParams({
                    "objectId": recordId,
                    "relatedListLabel": relatedListLabel
                });
                
                metadataAction.setCallback(this, function(res) {            
                    if (res.getState() === "SUCCESS" && res.getReturnValue()) {        
                        component.set("v.relatedListName", res.getReturnValue().name);
                        component.set("v.relatedObjectName",  res.getReturnValue().sobject);
                        component.set("v.columns", res.getReturnValue().columns);
                        
                        helper.loadItems(component);                      
                    } 
                    else if (res.getState() === "ERROR") {
                        $A.log("Errors", res.getError());
                    }           
                });  
                
                $A.enqueueAction(metadataAction);             
            }
        }
    },    
    startEdit : function(component, event, helper) {
        //Save a copy of items
        component.set("v.oldItems", JSON.parse(JSON.stringify(component.get("v.items"))));
        
        //Refresh the items
        helper.refreshItems(component, component.get("v.items"), "write");               
        
        //Refresh the UI elements(Edit button and actions)
        helper.refreshUIElements(component, event);
    },
    cancelEdit : function(component, event, helper) { 
        
        helper.refreshItems(component, component.get("v.oldItems"), "read");                       
        helper.refreshUIElements(component, event);        
        
     },
    saveEdit : function(component, event, helper) {                       
        if(helper.checkItems(component)){
            //Update the items
            var items = helper.updateItems(component);
            
            //OnSave items callback
            function saveCallback(status, errors){
                if(status=="SUCCESS"){
                    
                    helper.loadItemsAfterSave(component);      

                    //Display a confirmation Taost
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Success!",
                        "type" : "success",
                        "message": "The items list has been updated successfully"
                    });
                    toastEvent.fire();
                }
                if(status=="ERROR"){                      
                    var errMsg = null;
                    
                    if(errors[0] && errors[0].message){
                        errMsg = errors[0].message;
                    } 
                    if(errors[0] && errors[0].pageErrors) {
                        errMsg = errors[0].pageErrors[0].message;
                    }
                    
                    var toastEvent = $A.get("e.force:showToast");
                    toastEvent.setParams({
                        "title": "Error!",
                        "type" : "error",
                        "mode" : "sticky",
                        "message": "Server Error:" + errMsg
                    });
                    toastEvent.fire();                    
                }
            }        
            
            //Save items in the backend, don't keep unchanged records
            helper.saveItems(component, items, saveCallback, false);
        }else{
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Error!",
                "type" : "error",
                "mode" : "sticky",
                "message": "Save failed. Check your data and try again"
            });
            toastEvent.fire();
        }
    },

    createAndAddItem : function(component, event, helper){
        //1- Save existing changes
        var items = helper.updateItems(component);
        
        //OnSave items callback
        function saveCallback(status, errors){
            if(status=="SUCCESS"){
                //2- Add new record
                var recordTypeId = event.getSource().get('v.value');
                
                //On create items callback
                function createCallback(status, errors){
                    if(status=="SUCCESS"){
                        //Refresh the items                   
                        helper.loadItemsAfterNew(component);      
                    }
                    if(status=="ERROR"){                      
                        var errMsg = null;
                        
                        if(errors[0] && errors[0].message){
                            errMsg = errors[0].message;
                        } 
                        if(errors[0] && errors[0].pageErrors) {
                            errMsg = errors[0].pageErrors[0].message;
                        }
                        
                        var toastEvent = $A.get("e.force:showToast");
                        toastEvent.setParams({
                            "title": "Error!",
                            "type" : "error",
                            "mode" : "sticky",
                            "message": "Server Error:" + errMsg
                        });
                        toastEvent.fire();                    
                    }
                }        
                
                //Create new item
                helper.createAndAddItem(component, recordTypeId, createCallback);  
              
            }
            if(status=="ERROR"){                      
                var errMsg = null;
                
                if(errors[0] && errors[0].message){
                    errMsg = errors[0].message;
                } 
                if(errors[0] && errors[0].pageErrors) {
                    errMsg = errors[0].pageErrors[0].message;
                }
                
                var toastEvent = $A.get("e.force:showToast");
                toastEvent.setParams({
                    "title": "Error!",
                    "type" : "error",
                    "mode" : "sticky",
                    "message": "Server Error:" + errMsg
                });
                toastEvent.fire();                    
            }
        }        
        
        //Save items, keep unchanged records
        helper.saveItems(component, items, saveCallback, true);
      
    }
})