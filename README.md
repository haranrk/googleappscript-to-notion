# Google calendar to Notion

A simple utility for automatically creating a notion page for a new calendar event. It will create a new page and fills the page with attendee details.

# How to install

## Prerequisites 
The database should have a column of type `date`, named `Date`

## Manual method

1. Create a new appscript project from [here](https://script.google.com/home)

![image](https://user-images.githubusercontent.com/19757243/167087563-8fac5404-3f25-4faa-98c4-07ee14aa7298.png)

2. Copy and paste the contents into the file and save it 

![image](https://user-images.githubusercontent.com/19757243/167087871-466aee81-26bd-4c9b-bfeb-f7e51e72c7f6.png)

3. Enable the "Calendar API"

![image](https://user-images.githubusercontent.com/19757243/167088148-15952990-c516-4c62-b7c1-783ac863e094.png)

4. Create a new internal notion integration and copy the token 

![image](https://user-images.githubusercontent.com/19757243/167088801-d4b58756-e30e-44dd-8f79-392f39a16aeb.png)


5. Copy the generated token and paste it to the variable `MY_NOTION_TOKEN` in the script you had created earlier

![image](https://user-images.githubusercontent.com/19757243/167088972-57ff4fae-b1f6-4d9d-9987-c658c4c2e1e5.png)

6. Set the `DATABASE_ID` variable to the database you want the script to create a new page in 

![image](https://user-images.githubusercontent.com/19757243/167089263-00c4912e-df35-40a5-a0bb-b58779fac932.png)
> Source: https://developers.notion.com/docs/working-with-databases

7. Share the notion database with the integration you had created in step 4

![image](https://user-images.githubusercontent.com/19757243/167089615-83bc8259-0538-49cb-84f5-5dbb6f1be634.png)

8. Create a trigger for calendar update and assign `main` as the function to run when the trigger occurs

![image](https://user-images.githubusercontent.com/19757243/167089831-439c4ab9-30bd-4ad1-a0cf-cc508c25c352.png)
![image](https://user-images.githubusercontent.com/19757243/167089889-2f92b23a-2b72-4ff3-ba4e-4f5603f000f5.png)
![image](https://user-images.githubusercontent.com/19757243/167090063-58cf2f3a-670c-4862-a4a4-1ad66263c1f9.png)


Everything should work! You can try it out by running the main function to see if it works.
![image](https://user-images.githubusercontent.com/19757243/167090961-538fd804-80b8-47e8-9147-d7f7a3a68701.png)


