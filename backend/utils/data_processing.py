import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def extract_time_features(data):
    """
    Given a sequence of data, normalize it.
    Args:
        data: numpy array or pandas DataFrame
    Returns:
        normalized_data, scaler
    """
    scaler = MinMaxScaler()
    normalized_data = scaler.fit_transform(data)
    return normalized_data, scaler

def build_sliding_windows(data, seq_length):
    """
    Builds sliding windows from a 2D array (time steps x features).
    Args:
        data: numpy array of shape (N, F)
        seq_length: length of the sliding window
    Returns:
        numpy array of shape (N - seq_length + 1, seq_length, F)
    """
    data_ = []
    for i in range(len(data) - seq_length + 1):
        data_.append(data[i:i + seq_length])
    return np.array(data_)

def preprocess_sensor_data(df, feature_cols, seq_length):
    """
    Preprocess raw sensor DataFrame into normalized sliding windows.
    Args:
        df: pandas DataFrame containing sensor data
        feature_cols: list of column names to use
        seq_length: sequence length for the windows
    Returns:
        windows (np.array), scaler (MinMaxScaler instance)
    """
    # 1. Select features and drop NA
    df_clean = df[feature_cols].dropna()
    
    # 2. Normalize
    normalized_data, scaler = extract_time_features(df_clean.values)
    
    # 3. Create sliding windows
    windows = build_sliding_windows(normalized_data, seq_length)
    
    return windows, scaler

def load_cmapss_data(file_path):
    """
    Loads a CMAPSS dataset file.
    """
    # Columns definition based on CMAPSS readme
    columns = ['unit_number', 'time_cycles', 'setting_1', 'setting_2', 'setting_3']
    for i in range(1, 22):
        columns.append(f'sensor_{i}')
    
    # The files have 26 columns, the last two might be NaN due to trailing spaces, so we drop them if needed.
    df = pd.read_csv(file_path, sep=r'\s+', header=None, names=columns)
    return df

def load_intel_data(file_path):
    """
    Loads Intel Berkeley Lab dataset.
    """
    # Assuming standard Intel lab schema: date, time, epoch, moteid, temp, humidity, light, voltage
    columns = ['date', 'time', 'epoch', 'moteid', 'temp', 'humidity', 'light', 'voltage']
    # The Intel data.txt file is usually space separated or CSV. Using spaces as a guess.
    df = pd.read_csv(file_path, sep=r'\s+', header=None, names=columns, on_bad_lines='skip')
    return df
