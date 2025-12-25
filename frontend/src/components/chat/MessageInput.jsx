import { Image, Paperclip, Smile, Send } from 'lucide-react';

const MessageInput = ({ message, setMessage, onSend, isSending }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="border-t border-gray-100 bg-gradient-to-b from-white to-gray-50/50 backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-end gap-3 bg-white rounded-3xl shadow-lg border border-gray-100 p-2">
          {/* Attachment Buttons */}
          <div className="flex items-center gap-1 pl-2">
            <button 
              className="p-2.5 hover:bg-pink-50 rounded-full text-gray-400 hover:text-pink-500 transition-all duration-200 hover:scale-110 group relative"
              title="Send Image"
            >
              <Image size={20} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Image
              </span>
            </button>
            <button 
              className="p-2.5 hover:bg-purple-50 rounded-full text-gray-400 hover:text-purple-500 transition-all duration-200 hover:scale-110 group relative"
              title="Attach File"
            >
              <Paperclip size={20} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                File
              </span>
            </button>
          </div>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type a message..."
              rows="1"
              className="w-full px-4 py-3 bg-transparent border-none focus:outline-none resize-none text-gray-700 placeholder-gray-400"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
            {/* Character indicator for long messages */}
            {message.length > 100 && (
              <div className="absolute bottom-1 right-2 text-xs text-gray-400">
                {message.length}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 pr-1">
            <button 
              className="p-2.5 hover:bg-yellow-50 rounded-full text-gray-400 hover:text-yellow-500 transition-all duration-200 hover:scale-110 group relative"
              title="Add Emoji"
            >
              <Smile size={20} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Emoji
              </span>
            </button>
            
            {/* Send Button */}
            <button
              onClick={onSend}
              disabled={!message.trim() || isSending}
              className={`relative p-3 rounded-full transition-all duration-300 ${
                message.trim() && !isSending
                  ? 'bg-gradient-to-br from-pink-500 via-purple-500 to-pink-600 text-white hover:shadow-lg hover:shadow-pink-300 hover:scale-110 active:scale-95'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              title={message.trim() ? 'Send Message' : 'Type a message'}
            >
              <Send 
                size={18} 
                className={`transition-transform duration-300 ${
                  message.trim() && !isSending ? 'translate-x-0.5 -translate-y-0.5' : ''
                }`}
              />
              {/* Sending indicator */}
              {isSending && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {/* Pulse effect when active */}
              {message.trim() && !isSending && (
                <div className="absolute inset-0 rounded-full bg-pink-400 opacity-0 group-hover:opacity-20 animate-ping" />
              )}
            </button>
          </div>
        </div>

        {/* Typing indicator hint */}
        <div className="mt-2 px-4 text-xs text-gray-400 flex items-center justify-between">
          <span>Press Enter to send, Shift + Enter for new line</span>
          {message.trim() && !isSending && (
            <span className="text-pink-500 animate-pulse">Ready to send</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;