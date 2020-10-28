#language: en

# feature/test.feature
Feature: Test Message
  As a user called <Name>
  I want to write my name in the text box
  To see a message that says greeting 

  Scenario Outline: User sees the welcome message
    When I write my name <Name> in the text box
    And  I click in a button with the text GO
    Then I should see the message "Greetings <Name>"

    Examples:
        | Name | 
        | John |