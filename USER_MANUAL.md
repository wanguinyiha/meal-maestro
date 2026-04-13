# Meal Maestro - User Manual

## 📋 Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [User Guide](#user-guide)
5. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

**Meal Maestro** is a comprehensive meal planning and recipe management application designed to help users organize their kitchen activities, discover new recipes, and manage their meals efficiently. Whether you're a home cook looking to plan your week or someone discovering new culinary inspiration, Meal Maestro empowers you to take control of your kitchen.

### Key Highlights

- 🔐 Secure user authentication
- 🍳 Personal recipe management
- 📅 Weekly meal planning
- 🛒 Smart grocery list generation
- ⭐ Recipe discovery and favorites
- 🏆 Achievement tracking
- 📱 Fully responsive design

---

## 🚀 Getting Started

### Creating Your Account

#### Sign Up

1. Navigate to the **Sign Up** page from the homepage or login area
2. Enter your email address and choose a secure password
3. Click **Sign Up**
4. You'll receive a confirmation email to verify your account
5. Click the confirmation link in the email to activate your account
6. Log in with your credentials

#### Login

1. Go to the **Login** page
2. Enter your email and password
3. Click **Sign In**
4. You'll be directed to your dashboard

### Password Recovery

If you forget your password:

1. Click **Forgot Password** on the login page
2. Enter your email address
3. Click **Send Reset Link**
4. Check your email for a password reset link
5. Click the link and enter your new password
6. Return to login with your new password

---

## ✨ Features

### 1. **Authentication & Account Management**

#### Security Features

- Email-based account creation
- Password protection with secure hashing
- Session management with NextAuth
- Forgot password recovery
- Email confirmation for account verification

#### Your Profile

- View and manage your personal information
- Track your account settings
- Monitor your achievements and statistics

---

### 2. **Recipe Management**

Meal Maestro allows you to create, organize, and manage your recipe collection.

#### Creating a Recipe

1. Navigate to **Recipes** from the main menu
2. Click **Create New Recipe**
3. Fill in the following details:
   - **Recipe Name**: Give your recipe a descriptive title
   - **Description**: Brief overview of the dish
   - **Cuisine Type**: Select the cuisine category
   - **Ingredients**:
     - Add ingredient name and quantity
     - Click **Add Ingredient** to add more
   - **Instructions**: Step-by-step cooking instructions
   - **Nutritional Info** (Optional):
     - Calories
     - Protein
     - Carbs
     - Fat
   - **Cooking Time**: Estimated preparation and cooking duration
   - **Servings**: Number of servings the recipe makes
   - **Difficulty Level**: Easy, Medium, or Hard

4. Click **Save Recipe**

#### Viewing Recipes

- **Recipe List**: See all your recipes in card view
- **Recipe Details**: Click on any recipe to see complete information
- **Search & Filter**: Use the search bar to find recipes by name or cuisine type

#### Editing a Recipe

1. Go to **Recipes**
2. Find the recipe you want to edit
3. Click the **Edit** button
4. Modify the details as needed
5. Click **Save Changes**

#### Deleting a Recipe

1. Navigate to your recipe
2. Click the **Delete** button
3. Confirm the deletion in the dialog box
4. The recipe will be permanently removed

---

### 3. **Spoonacular Recipe Integration**

Discover thousands of recipes from the Spoonacular API without leaving the app.

#### Searching External Recipes

1. Navigate to **Recipes** > **Browse Spoonacular**
2. Use the search bar to find recipes by ingredient or dish name
3. Browse through results with pagination
4. Click on any recipe to view detailed information
5. Click **Add to Favorites** to save it for later
6. Click **View Full Recipe** to see complete instructions

#### Importing Recipes

1. Find a recipe you love from Spoonacular
2. Click **Import Recipe**
3. The recipe will be added to your personal collection
4. You can now edit and customize it as needed

---

### 4. **Meal Planning**

Plan your meals for the week ahead with an intuitive interface.

#### Creating a Meal Plan

1. Navigate to **Planner** from the main menu
2. Select the week you want to plan
3. For each day:
   - Click on the meal slot (Breakfast, Lunch, Dinner, Snack)
   - Search for recipes from your collection or Spoonacular
   - Select a recipe to add
4. The meal will be displayed on your calendar
5. Click **Save Plan** to store your weekly plan

#### Managing Your Plan

- **View All Meals**: See your complete weekly meal plan
- **Add Meals**: Click any empty slot to add a meal
- **Remove Meals**: Click on a meal and select remove
- **Adjust Portions**: Modify serving sizes as needed
- **Duplicate Plans**: Copy last week's plan and adjust as needed

#### Benefits of Meal Planning

- Stay organized throughout the week
- Ensure balanced nutrition
- Reduce food waste
- Simplify grocery shopping
- Save time on meal decisions

---

### 5. **Grocery Lists**

Automatically generate shopping lists based on your meal plans.

#### Generating a Grocery List

1. Go to **Grocery** from the navigation menu
2. Your current meal plan's ingredients are automatically compiled
3. The list is organized by category:
   - Produce
   - Dairy
   - Meat & Seafood
   - Pantry Items
   - Other

#### Shopping List Management

- **Check Off Items**: Mark items as you shop by clicking the checkbox
- **Add Custom Items**: Add ingredients not from your meal plan
- **Remove Items**: Delete items you don't need
- **Print List**: Print your shopping list for easy reference
- **Adjust Quantities**: Modify ingredient amounts if needed
- **View Recipe**: Click any ingredient to see which recipe uses it

#### Tips for Efficient Shopping

- Check your pantry before shopping to avoid duplicates
- Group items by store sections for faster checkout
- Consider buying in bulk for items you use frequently
- Mark completed items as you go to stay organized

---

### 6. **Favorites & Bookmarks**

Keep your favorite recipes easily accessible.

#### Adding to Favorites

1. Navigate to any recipe
2. Click the **Star** icon
3. The recipe is now in your favorites

#### Viewing Favorites

1. Go to **Recipes**
2. Click **Favorites** filter or tab
3. See all your bookmarked recipes

#### Removing from Favorites

1. Click the filled **Star** icon on any favorite recipe
2. It will be removed from your favorites list

---

### 7. **User Profile & Achievements**

Track your cooking journey and earn badges.

#### Profile Overview

1. Click your **Profile** in the navigation or sidebar
2. View your account information:
   - Account creation date
   - Total recipes created
   - Favorite recipes count
   - Achievements earned

#### Achievements

Earn badges as you use Meal Maestro:

- **First Recipe**: Create your first recipe
- **Meal Master**: Complete your first meal plan
- **Chef's Collection**: Create 10 recipes
- **Weekly Planner**: Plan meals for a full week
- **Spoonacular Explorer**: Import 5 recipes
- **Grocery Expert**: Generate 5 grocery lists

#### Achievement Display

- View earned badges on your profile
- See achievement progress in your profile details
- Share achievements with others

---

### 8. **Settings & Preferences**

Customize your Meal Maestro experience.

#### Account Settings

1. Navigate to **Settings**
2. Configure:
   - **Theme**: Choose between Light and Dark mode
   - **Notifications**: Enable/disable email notifications
   - **Privacy Settings**: Manage data sharing preferences
   - **Default Serving Size**: Set your preferred portion size

#### Dietary Preferences

1. Go to **Settings** > **Dietary Preferences**
2. Select any dietary restrictions:
   - Vegetarian
   - Vegan
   - Gluten-Free
   - Dairy-Free
   - Nut-Free
   - Other (specify)
3. Save your preferences

---

## 👤 User Guide

### Daily Workflow

#### Morning: Check Today's Meals

1. Open Meal Maestro
2. Go to **Planner** to see today's meals
3. Note which recipes you need to prepare

#### Day Before Shopping: Generate Grocery List

1. Visit **Planner** to confirm your week
2. Go to **Grocery** to view your shopping list
3. Add any additional items
4. Print or save the list

#### Cooking Time: Use Recipes

1. Navigate to the recipe you're preparing
2. Review ingredients and instructions step-by-step
3. Adjust portions if needed using the serving size multiplier

#### End of Week: Plan Next Week

1. Create new recipes if inspired
2. Plan next week's meals
3. Generate updated grocery list

### Advanced Tips

#### Recipe Organization

- Use descriptive recipe names for easy finding
- Add notes to recipes for personal tips
- Tag recipes by occasion (weeknight, entertaining, etc.)

#### Smart Meal Planning

- Plan meals that share common ingredients to save money
- Balance variety across the week
- Consider prep time when planning
- Leave flexibility for dining out

#### Maximize Grocery Efficiency

- Shop during off-peak hours for fresh picks
- Check store flyers before making your list
- Buy seasonal produce for quality and savings
- Use the grocery list to avoid impulse purchases

---

## ❓ Troubleshooting

### Account Issues

#### Can't Log In

- Verify you're using the correct email and password
- Reset your password if you're unsure
- Check your email for account confirmation
- Clear browser cache and cookies
- Try a different browser

#### Email Not Received

- Check spam/junk folder
- Allow 5-10 minutes for confirmation emails
- Verify the email address is correct
- Request a new confirmation email

#### Password Reset Not Working

- Ensure you're using the email associated with your account
- Check spam folder for reset link
- Links expire after 24 hours; request a new one if needed
- Try resetting from an incognito/private browser window

### Recipe Management

#### Can't Create or Save Recipes

- Ensure all required fields are filled
- Check that ingredient quantities are valid numbers
- Verify instructions are not empty
- Try refreshing the page if fields are cleared unexpectedly

#### Recipe Not Appearing in List

- Refresh your browser
- Use search to locate the recipe
- Check if it was accidentally deleted
- Try logging out and back in

#### Can't Import Spoonacular Recipes

- Check your internet connection
- Verify Spoonacular is spelled correctly
- Search results limited by API
- Try searching with simpler terms

### Meal Planning Issues

#### Can't Add Meals to Calendar

- Ensure you've created or imported recipes first
- Refresh the page if slots appear frozen
- Clear browser cache if interface is unresponsive

#### Missing Meal Plan

- Plans are saved to your account
- Log in to the correct account
- Check different weeks if plan was scheduled ahead

### Grocery List Problems

#### Ingredients Not Appearing

- Verify meals are properly saved in your plan
- Refresh the grocery page
- Check if recipes have ingredients listed

#### Duplicate Items

- This happens when multiple recipes share ingredients
- Check the quantity and adjust if needed
- The list displays total amount needed

### General Performance Issues

#### Page Loading Slowly

- Check your internet connection speed
- Clear browser cache (Ctrl+Shift+Delete)
- Disable browser extensions temporarily
- Try a different browser
- Restart your device

#### Features Not Working

- Refresh the page (F5 or Ctrl+R)
- Clear browser cache
- Log out and log back in
- Check browser compatibility (Chrome, Firefox, Safari, Edge recommended)

#### Data Not Saving

- Verify you clicked the save button
- Check internet connection during save
- Wait for success confirmation message
- If issue persists, contact support

### Browser Compatibility

Meal Maestro works best on:

- Chrome (latest version)
- Firefox (latest version)
- Safari (latest version)
- Edge (latest version)

Mobile browsers supported:

- iOS Safari 12+
- Chrome Mobile
- Firefox Mobile
- Samsung Internet

---

## 📞 Getting Help

### When to Contact Support

- Account recovery issues that persist
- Data loss or corruption
- Features not working after troubleshooting
- General questions about functionality
- Bug reports

### Tips for Contacting Support

- Provide screenshots of issues
- Describe the exact steps to reproduce the problem
- Mention your browser and device
- Include any error messages you see

---

## 🔒 Privacy & Security

### Your Data is Safe

- Encryption for all sensitive data
- Secure password storage
- Regular security updates
- No sharing of personal information with third parties
- GDPR compliant data handling

### Best Practices

- Use a strong, unique password
- Never share your login credentials
- Log out on shared devices
- Review connected apps in settings
- Report suspicious activity immediately

---

## 🎉 Tips & Tricks

### Maximize Your Experience

1. **Batch Create Recipes**: Add multiple recipes at once during free time
2. **Recurring Meals**: Plan similar meals on different days to simplify
3. **Seasonal Planning**: Search Spoonacular for seasonal ingredients
4. **Meal Prep**: Plan meals that allow for batch cooking
5. **Theme Nights**: Designate specific cuisines for each day
6. **Budget Meals**: Filter recipes by ingredient price range
7. **Quick Conversions**: Use the serving size multiplier for portion adjustments

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save (when editing)
- `Escape`: Close dialogs and modals
- `Enter`: Submit forms (when available)

---

## 📱 Mobile Experience

Meal Maestro is fully responsive and works seamlessly on mobile devices.

### Mobile-Specific Tips

- Use landscape mode for better meal planner view
- Take a photo of your grocery list for reference
- Bookmark frequently used recipes
- Use mobile notifications for meal reminders
- Access settings from the hamburger menu

---

## 🚀 Getting the Most Value

### Week 1: Getting Started

- Create 3-5 of your favorite recipes
- Explore Spoonacular for inspiration
- Plan your first week

### Week 2: Finding Your Flow

- Experiment with different planning strategies
- Refine your recipe collection
- Optimize your shopping experience

### Week 3+: Mastery

- Build a comprehensive recipe library
- Establish efficient meal planning routines
- Share tips with other users
- Explore advanced features

---

## 📝 Last Updated

**Version**: 1.0  
**Last Updated**: April 2026

For the most current information and updates, check the app regularly for notifications.

---

## ✅ Checklist: Your First Week

After reading this manual, follow this checklist to get started:

- [ ] Create your account
- [ ] Set up your profile
- [ ] Try creating one recipe
- [ ] Search for a recipe on Spoonacular
- [ ] Import or add a recipe to favorites
- [ ] Create your first meal plan
- [ ] Generate a grocery list
- [ ] Check your achievements
- [ ] Explore settings and preferences
- [ ] Invite a friend to try Meal Maestro

---

**Welcome to Meal Maestro! Happy cooking! 🍳**
