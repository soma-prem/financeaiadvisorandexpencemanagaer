import sys
sys.path.append('.')

from tools.supabase_db import get_user_transactions
from tools.data_processor import load_and_clean_data
import pandas as pd

# Test with your user ID
user_id = '3475908c-9a30-43ce-84e8-53ca57adc7de'
print(f'Testing with user_id: {user_id}')

# Test direct database call
transactions = get_user_transactions(user_id)
print(f'Direct DB result: {len(transactions)} transactions')

# Test data processor
df = load_and_clean_data(user_id)
print(f'DataProcessor result: {len(df)} rows')
print(f'DataProcessor empty: {df.empty}')
