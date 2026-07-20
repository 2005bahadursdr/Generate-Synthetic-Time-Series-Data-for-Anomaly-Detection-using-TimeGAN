import torch
import torch.nn as nn

class LSTMAutoencoder(nn.Module):
    def __init__(self, input_dim, hidden_dim, num_layers=2):
        super(LSTMAutoencoder, self).__init__()
        
        # Encoder
        self.encoder = nn.LSTM(
            input_size=input_dim, 
            hidden_size=hidden_dim, 
            num_layers=num_layers, 
            batch_first=True
        )
        
        # Decoder
        self.decoder = nn.LSTM(
            input_size=hidden_dim, 
            hidden_size=hidden_dim, 
            num_layers=num_layers, 
            batch_first=True
        )
        
        # Output layer
        self.output_layer = nn.Linear(hidden_dim, input_dim)

    def forward(self, x):
        # x shape: (batch_size, seq_len, input_dim)
        
        # Encode
        encoded_output, (hidden, cell) = self.encoder(x)
        
        # We use the final hidden state to reconstruct the sequence
        # hidden shape: (num_layers, batch_size, hidden_dim)
        # We need to repeat the last hidden state seq_len times
        seq_len = x.shape[1]
        
        # Take the hidden state of the last layer: (batch_size, hidden_dim)
        last_hidden = hidden[-1]
        
        # Repeat to match sequence length: (batch_size, seq_len, hidden_dim)
        repeated_hidden = last_hidden.unsqueeze(1).repeat(1, seq_len, 1)
        
        # Decode
        decoded_output, _ = self.decoder(repeated_hidden)
        
        # Map back to original feature dimension
        reconstructed = self.output_layer(decoded_output)
        
        return reconstructed
