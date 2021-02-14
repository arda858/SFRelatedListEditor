({
    applyShadowEffect : function(component, event) {
        //Apply the shadow effect on the grid
        var gridContainer = component.find("gridContainer");
        $A.util.toggleClass(gridContainer, "shadow-effect");
    },
    toggleEditButton : function(component, event){
        //Show/hide the edit button
        var editButton = component.find("editButton");
        $A.util.toggleClass(editButton, "hidden");
    },   
    toggleGridActions : function(component, event){
        //Show/hide the action bar on the bottom
        var gridActions = component.find("gridActions");
        $A.util.toggleClass(gridActions, "hidden");
    },
    toggleNewButton : function(component, event){
        //Show/hide the create buttons
        var createButton = component.find("createButton");
        $A.util.toggleClass(createButton, "hidden");
        var createButton2 = component.find("createButton2");
        $A.util.toggleClass(createButton2, "hidden");
        
    },   
    refreshUIElements : function(component, event){
        //Apply the shadow on the grid
        this.applyShadowEffect(component, event);
        
        //toggle the edit button
        this.toggleEditButton(component, event);
        
        //toggle the grid actions
        this.toggleGridActions(component, event);
        
        //toggle the create actions
        this.toggleNewButton(component, event);
    },
    prepareListParams: function(component){
        var recordId = component.get("v.recordId");
        var relatedListLabel = component.get("v.relatedListLabel") ;
        var relatedListName = component.get("v.relatedListName") ;

        if(relatedListLabel.includes(":")){
            recordId = component.get("v.simpleRecord.AccountId");
        }
        console.log(params)  
        
        var params = {
            "objectId": recordId,
            "relatedlistName": relatedListName
        }
                console.log(params)  

        return params;
    },
    loadItems : function(component){
        //Load items from Salesforce
        var dataAction = component.get("c.getRelatedListItems");

        dataAction.setParams(this.prepareListParams(component));
        
        dataAction.setCallback(this, function(res) {                        
            if (res.getState() === "SUCCESS") {                 
                var gridContainer = component.find("gridContainer");
                $A.util.toggleClass(gridContainer, "hidden");   
                if (res.getReturnValue() != null){
                    res.getReturnValue().sort((a, b) => (a.Name > b.Name) ? 1 : -1)
                }
                component.set("v.items", res.getReturnValue() ); 
                //Start Edit mode
                component.set("v.oldItems",  res.getReturnValue()); 
                 //Refresh the items
                this.refreshItems(component, component.get("v.items"), "write");               
                //Refresh the UI elements(Edit button and actions)
                this.refreshUIElements(component, event);
                
                

            }
            else if (res.getState() === "ERROR") {
                $A.log("Errors", res.getError());
            }
        });   
        
        $A.enqueueAction(dataAction);    
    },
    loadItemsAfterNew : function(component){
        //Load items from Salesforce
        var dataAction = component.get("c.getRelatedListItems");
        dataAction.setParams(this.prepareListParams(component));

        dataAction.setCallback(this, function(res) {                        
            if (res.getState() === "SUCCESS") {                 
                var gridContainer = component.find("gridContainer");
                if (res.getReturnValue() != null){
                    res.getReturnValue().sort((a, b) => (a.Name > b.Name) ? 1 : -1)
                }
                component.set("v.items", res.getReturnValue() ); 
                //Start Edit mode
                component.set("v.oldItems",  res.getReturnValue()); 
                 //Refresh the items
                this.refreshItems(component, component.get("v.items"), "write");               
 
            }
            else if (res.getState() === "ERROR") {
                $A.log("Errors", res.getError());
            }
        });   
        
        $A.enqueueAction(dataAction);    
    },
    loadItemsAfterSave : function(component){
        //Load items from Salesforce
        var dataAction = component.get("c.getRelatedListItems");
        dataAction.setParams(this.prepareListParams(component));

        dataAction.setCallback(this, function(res) {                        
            if (res.getState() === "SUCCESS") {                 
                var gridContainer = component.find("gridContainer");
                if (res.getReturnValue() != null){
                    res.getReturnValue().sort((a, b) => (a.Name > b.Name) ? 1 : -1)
                }
                component.set("v.items", res.getReturnValue() ); 
                //Start Edit mode
                component.set("v.oldItems",  res.getReturnValue()); 
                 //Refresh the items
                this.refreshItems(component, component.get("v.items"), "read");               
         		this.refreshUIElements(component, event);        

            }
            else if (res.getState() === "ERROR") {
                $A.log("Errors", res.getError());
            }
        });   
        
        $A.enqueueAction(dataAction);    
    },
    refreshItems : function(component, items, displayMode){
        //Set the display mode
        console.log("in refresh");
        component.set("v.displayMode", displayMode); 
        
        //Refresh the items        
        component.set("v.items", JSON.parse(JSON.stringify(items)));                
    },
    getCellComponents : function(component){
        var cellComponents = [];
        var rows = [];
        var foundRows = component.find("row");
        
        console.log("getCellComponents");
        console.log(foundRows);
        
        if(foundRows){
        if(foundRows.length){
            rows = foundRows; 
        }
        else{
            rows.push( foundRows)
        }
        rows.forEach(function(row){
            row.get("v.body").forEach(function(cell){
                cellComponents.push(cell);
            })
        });
        }
        
        
        return cellComponents;
    },
    checkItems : function(component){
        var cellComponents = this.getCellComponents(component);  

        
        for(var c=0; c < cellComponents.length; c++){
            var cellCmp = cellComponents[c];
            if (cellCmp.get("v.hasErrors")){
                return false;
            }
        }                
        
        return true;
    },
    updateItems : function(component){
        console.log("in update")        
        var items = component.get("v.items");
        var cellComponents = this.getCellComponents(component);
        
        //Update the items from cells
        cellComponents.forEach(function(cellCmp){
            var column = cellCmp.get("v.column");
            var item = items[cellCmp.get("v.itemRank")];
            
            item[column.name] = cellCmp.get("v.value");  
            
            if(column.type=='Reference'){
                item[column.name + '__Name'] = cellCmp.get("v.refLabel");
            }
        });
        
        return items;
    },
    saveItems : function(component, items, saveCallback, keepunchanged){
        //Save items on Salesforce
        var saveItemsAction = component.get("c.saveRelatedListItems");
        console.log(component.get("v.items"))
        
        saveItemsAction.setParams({
            "jsonData": JSON.stringify(component.get("v.items")),
            "keepunchanged": keepunchanged
        });	
        
        saveItemsAction.setCallback(this, function(res) {            
            saveCallback(res.getState(), res.getError());
        });   
        
        $A.enqueueAction(saveItemsAction);
    },
    createAndAddItem : function(component, recordTypeId, createCallback){
        //Save items on Salesforce
        var recordId = component.get("v.recordId");

        var newItem = {
            'objName' : component.get("v.relatedObjectName"),
            'RecordTypeId' : recordTypeId
        }
        
        switch( recordId.substring(0, 3)) {
            case '00Q':
                newItem['Target_Lead__c'] = recordId;
                newItem['Lead__c'] = recordId;
                break;        
            case '006':
                newItem['Opportunity__c'] = recordId;
                newItem['Target_Account__c'] = component.get("v.simpleRecord.AccountId");;
                newItem['Account__c'] = component.get("v.simpleRecord.AccountId");;

                break;   
        }
       
              
        console.log(newItem)
        var createAndAddItemAction = component.get("c.createNewItem");
        
        createAndAddItemAction.setParams({
            "jsonData": JSON.stringify(newItem)
        });	
        
        createAndAddItemAction.setCallback(this, function(res) {            
            createCallback(res.getState(), res.getError());
        });   
        
        $A.enqueueAction(createAndAddItemAction);
    }
})