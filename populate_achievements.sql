-- Insert sample achievements into the achievements table
-- Run this in your Supabase SQL editor or database console

INSERT INTO achievements (id, title, description, icon, target) VALUES
('meal-planner-beginner', 'Meal Planner Beginner', 'Plan your first meal', 'Calendar', 1),
('weekly-warrior', 'Weekly Warrior', 'Plan meals for a full week', 'Calendar', 7),
('streak-master', 'Streak Master', 'Maintain a planning streak for 30 days', 'Flame', 30),
('recipe-collector', 'Recipe Collector', 'Save 10 favorite recipes', 'Star', 10),
('money-saver', 'Money Saver', 'Save $100 through meal planning', 'DollarSign', 100),
('first-recipe-created', 'First Recipe Created', 'Create your first custom recipe', 'ChefHat', 1),
('grocery-guru', 'Grocery Guru', 'Complete your first grocery list', 'ShoppingCart', 1),
('nutrition-ninja', 'Nutrition Ninja', 'Set up dietary preferences', 'Target', 1),
('social-chef', 'Social Chef', 'Share a recipe with another user', 'Users', 1),
('budget-boss', 'Budget Boss', 'Save $500 total', 'DollarSign', 500),
('holiday-chef', 'Holiday Chef', 'Plan meals during holidays', 'Calendar', 1),
('healthy-habits', 'Healthy Habits', 'Plan 50 healthy meals', 'Heart', 50),
('family-feaster', 'Family Feaster', 'Plan meals for 4+ servings', 'Users', 1)
ON CONFLICT (id) DO NOTHING;

-- Note: Replace 'ShoppingCart', 'Users', 'Heart' with actual icon names from your iconMap if needed
-- The iconMap in the code has: ChefHat, Calendar, DollarSign, Target, Trophy, Flame, Star, TrendingUp, Award
-- You may need to add more icons or adjust the names.