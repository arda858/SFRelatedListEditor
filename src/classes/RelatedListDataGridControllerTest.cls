@isTest
public class RelatedListDataGridControllerTest {
 	static testMethod void testGetRelatedListsMetadata()
    {
		Test.startTest();        
        Test.setMock(HttpCalloutMock.class, new RestAPIMockHttpResponseGenerator());        
                
        Object[] relatedListsMatadata = RelatedListDataGridController.getRelatedListsMetadata('0010Y000003iFovQAE');
		System.assertEquals(7, relatedListsMatadata.size());        
        
        Test.stopTest();        
    }
    
    
    static testMethod void testGetRelatedListMetadata()
    {
        Test.startTest();        
        Test.setMock(HttpCalloutMock.class, new RestAPIMockHttpResponseGenerator());        
                
        Object relatedListsMatadata = RelatedListDataGridController.getRelatedListMetadata('0010Y000003iFovQAE',
                                                                                            'Contacts');
		System.assertEquals(true, relatedListsMatadata != null);        
        
        Test.stopTest();         
    }
    
    static testMethod void testGetRelatedListItems()
    {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new RestAPIMockHttpResponseGenerator());        
        
        Object[] contacts = RelatedListDataGridController.getRelatedListItems('0010Y000003iFovQAE', 
                                                                               'Contacts');        
		System.assertEquals(1, contacts.size());         
        
        Test.stopTest();
    } 
    
   
    static testMethod void testSaveRelatedListItems()
    {
        Test.startTest();
        Test.setMock(HttpCalloutMock.class, new RestAPIMockHttpResponseGenerator());        
        
        Object[] contacts = RelatedListDataGridController.getRelatedListItems('0010Y000003iFovQAE', 
                                                                               'Contacts');                
		Account account = new Account();
        account.Name='Test Account' ;
        insert account;

        Contact contact = new Contact();
        contact.Accountid= account.id;
        contact.FirstName='Test';
        contact.LastName='Test';        
        insert contact;

        Map<String, Object> mContact = (Map<String, Object>)contacts.get(0);        
        mContact.put('AccountId', contact.AccountId);
        mContact.put('Id', contact.Id);        
        mContact.remove('OwnerId');
        
		Boolean result = RelatedListDataGridController.saveRelatedListItems(System.JSON.serialize(contacts),true);
        System.assertEquals(true, result);
        
        Object[] candidates = RelatedListDataGridController.getLookupCandidates('Account', 'Test');
        System.assertEquals(true, candidates.size() > 0);
        
        Test.stopTest();        
    }
}