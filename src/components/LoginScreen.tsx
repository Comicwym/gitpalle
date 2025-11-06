import { useState } from "react";
import { User } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const users = [
    { name: "/dev/null" },
  ];

  const [selectedUser, setSelectedUser] = useState(0);

  return (
    <div 
      className="h-screen w-full flex items-center justify-center"
      style={{ background: "hsl(var(--win95-desktop))" }}
    >
      <div 
        className="w-96 p-4"
        style={{
          background: "hsl(var(--win95-gray))",
          border: "2px solid hsl(var(--border-light))",
          borderRight: "2px solid hsl(var(--border-dark))",
          borderBottom: "2px solid hsl(var(--border-dark))",
          boxShadow: "4px 4px 8px rgba(0,0,0,0.3)"
        }}
      >
        {/* Title Bar */}
        <div 
          className="px-2 py-1 mb-3 text-white font-bold"
          style={{
            background: "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)"
          }}
        >
          User Login
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm font-bold">Select a user to login to</p>

          {/* User List */}
          <div 
            className="space-y-1 p-2"
            style={{
              background: "white",
              border: "2px solid hsl(var(--border-dark))",
              borderRight: "2px solid hsl(var(--border-light))",
              borderBottom: "2px solid hsl(var(--border-light))"
            }}
          >
            {users.map((user, index) => (
              <button
                key={index}
                onClick={() => setSelectedUser(index)}
                className={`w-full flex items-center gap-3 p-2 text-left ${
                  selectedUser === index ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <div 
                  className="w-10 h-10 flex items-center justify-center rounded-sm"
                  style={{
                    background: "hsl(var(--win95-gray))",
                    border: "2px solid hsl(var(--border-light))",
                    borderRight: "2px solid hsl(var(--border-dark))",
                    borderBottom: "2px solid hsl(var(--border-dark))"
                  }}
                >
                  <User className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm">{user.name}</div>
                  <div className="text-xs opacity-75">{user.subtitle}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={onLogin}
              className="px-6 py-2 font-bold text-sm"
              style={{
                background: "hsl(var(--win95-gray))",
                border: "2px solid hsl(var(--border-light))",
                borderRight: "2px solid hsl(var(--border-dark))",
                borderBottom: "2px solid hsl(var(--border-dark))",
              }}
            >
              OK
            </button>
            <button
              className="px-6 py-2 font-bold text-sm"
              style={{
                background: "hsl(var(--win95-gray))",
                border: "2px solid hsl(var(--border-light))",
                borderRight: "2px solid hsl(var(--border-dark))",
                borderBottom: "2px solid hsl(var(--border-dark))",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
