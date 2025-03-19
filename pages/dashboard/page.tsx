"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import { SignedIn, SignedOut, UserButton, SignOutButton } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import {
  Moon,
  Sun,
  Copy,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Pencil,
  Search,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useUser } from "@clerk/nextjs";

export default function DashboardPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<{
    [key: string]: boolean;
  }>({});
  const [passwords, setPasswords] = useState<any[]>([]);
  const [newEntry, setNewEntry] = useState({
    site: "",
    url: "",
    username: "",
    password: "",
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editEntry, setEditEntry] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useUser();
  const userId = user?.id;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditPasswordVisible, setIsEditPasswordVisible] = useState(false); // New state for edit dialog

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userId) {
      const fetchPasswords = async () => {
        try {
          const response = await fetch("/api/passwords", {
            method: "GET",
            headers: { "User-ID": userId },
          });
          if (!response.ok) throw new Error("Failed to fetch passwords");
          const data = await response.json();
          const sortedData = data.sort((a: any, b: any) =>
            a.site.localeCompare(b.site)
          );
          setPasswords(sortedData);
        } catch (error) {
          console.error("Error fetching passwords:", error);
        }
      };
      fetchPasswords();
    }
  }, [userId]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const savePassword = async () => {
    const newPassword = {
      site: newEntry.site,
      url: newEntry.url,
      username: newEntry.username,
      password: newEntry.password,
    };
    try {
      const response = await fetch("/api/passwords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-ID": userId!,
        },
        body: JSON.stringify(newPassword),
      });
      if (!response.ok) throw new Error("Failed to save password");
      const savedPassword = await response.json();
      const updatedPasswords = [...passwords, savedPassword].sort((a, b) =>
        a.site.localeCompare(b.site)
      );
      setPasswords(updatedPasswords);
      setNewEntry({ site: "", url: "", username: "", password: "" });
      return true;
    } catch (error) {
      console.error("Error adding password:", error);
      return false;
    }
  };

  const handleAddPassword = async () => {
    const success = await savePassword();
    if (success) {
      setIsAddOpen(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setPasswords(passwords.filter((p) => p.id !== id));
      const response = await fetch("/api/passwords", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "User-ID": userId!,
        },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete password");
    } catch (error) {
      console.error("Error deleting password:", error);
    }
  };

  const handleEdit = (id: string) => {
    const entryToEdit = passwords.find((p) => p.id === id);
    if (entryToEdit) {
      setEditEntry(entryToEdit);
      setIsEditOpen(true);
      setIsEditPasswordVisible(false); // Reset visibility when opening edit dialog
    }
  };

  const handleEditSave = async () => {
    try {
      const updatedPasswords = passwords
        .map((p) => (p.id === editEntry.id ? { ...editEntry } : p))
        .sort((a, b) => a.site.localeCompare(b.site));
      setPasswords(updatedPasswords);
      setIsEditOpen(false);
      setEditEntry(null);
      const response = await fetch("/api/passwords", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "User-ID": userId!,
        },
        body: JSON.stringify(editEntry),
      });
      if (!response.ok) throw new Error("Failed to update password");
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const handleTogglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyPassword = (password: string) => {
    navigator.clipboard
      .writeText(password)
      .then(() => {
        alert("Password copied to clipboard!");
      })
      .catch((err) => {
        alert("Failed to copy password: " + err);
      });
  };

  const filteredPasswords = passwords.filter((item) =>
    item.site.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const checkPasswordStrength = (password: string) => {
    if (password.length < 8) return "Weak";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return "Strong";
    return "Medium";
  };

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    return Array(16)
      .fill(0)
      .map(() => chars.charAt(Math.floor(Math.random() * chars.length)))
      .join("");
  };

  return (
    <>
      <Head>
        <title>PassGuard Dashboard</title>
      </Head>
      <SignedOut></SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-gray-50 p-8 dark:bg-gray-950">
          {/* Header */}
          <header className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
              PassGuard Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox:
                      "h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700",
                    userButtonTrigger:
                      "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  },
                }}
              />
              <SignOutButton>
                <button className="cursor-pointer flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                  Sign Out
                </button>
              </SignOutButton>
              {mounted && (
                <button
                  onClick={toggleTheme}
                  type="button"
                  className="cursor-pointer relative inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-800 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  {theme === "dark" ? (
                    <Moon className="h-[1.2rem] w-[1.2rem]" />
                  ) : (
                    <Sun className="h-[1.2rem] w-[1.2rem]" />
                  )}
                  <span className="sr-only">Toggle theme</span>
                </button>
              )}
            </div>
          </header>

          {/* Main Dashboard */}
          <main className="space-y-6">
            {/* Search Bar and Add Password Button */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by Website Name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="cursor-pointer"
                    onClick={() => setIsAddOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Password
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Password</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input
                      placeholder="Website Name"
                      name="site"
                      value={newEntry.site}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, site: e.target.value })
                      }
                    />
                    <Input
                      placeholder="URL"
                      name="url"
                      value={newEntry.url}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, url: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Username or Email"
                      name="username"
                      value={newEntry.username}
                      onChange={(e) =>
                        setNewEntry({ ...newEntry, username: e.target.value })
                      }
                    />
                    <div className="relative">
                      <Input
                        placeholder="Password"
                        name="password"
                        type={isPasswordVisible ? "text" : "password"}
                        value={newEntry.password}
                        onChange={(e) =>
                          setNewEntry({ ...newEntry, password: e.target.value })
                        }
                      />
                      <Button
                        className="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2"
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                      >
                        {isPasswordVisible ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      onClick={() =>
                        setNewEntry({
                          ...newEntry,
                          password: generatePassword(),
                        })
                      }
                    >
                      Generate Password
                    </Button>
                  </div>
                  <p className="text-sm">
                    Strength: {checkPasswordStrength(newEntry.password)}
                  </p>
                  <DialogFooter>
                    <Button
                      className="cursor-pointer"
                      onClick={handleAddPassword}
                    >
                      Save
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Password Cards Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPasswords.length > 0 ? (
                filteredPasswords.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{item.site}</CardTitle>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {item.url}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Username</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {item.username}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Password</p>
                        <p className="text-gray-700 dark:text-gray-300">
                          {visiblePasswords[item.id]
                            ? item.password
                            : "••••••••"}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            className="cursor-pointer"
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              handleTogglePasswordVisibility(item.id)
                            }
                          >
                            {visiblePasswords[item.id] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            className="cursor-pointer"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleCopyPassword(item.password)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="cursor-pointer flex-1 flex items-center gap-2"
                          onClick={() => handleEdit(item.id)}
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="cursor-pointer flex-1 flex items-center gap-2"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">
                  No passwords found! {searchQuery}
                </p>
              )}
            </div>

            {/* Edit Password Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Password</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Website Name"
                    value={editEntry?.site || ""}
                    onChange={(e) =>
                      setEditEntry({ ...editEntry, site: e.target.value })
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={editEntry?.url || ""}
                    onChange={(e) =>
                      setEditEntry({ ...editEntry, url: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Username or Email"
                    value={editEntry?.username || ""}
                    onChange={(e) =>
                      setEditEntry({ ...editEntry, username: e.target.value })
                    }
                  />
                  <div className="relative">
                    <Input
                      placeholder="Password"
                      type={isEditPasswordVisible ? "text" : "password"}
                      value={editEntry?.password || ""}
                      onChange={(e) =>
                        setEditEntry({ ...editEntry, password: e.target.value })
                      }
                    />
                    <Button
                      className="cursor-pointer absolute right-2 top-1/2 transform -translate-y-1/2"
                      size="icon"
                      variant="ghost"
                      onClick={() =>
                        setIsEditPasswordVisible(!isEditPasswordVisible)
                      }
                    >
                      {isEditPasswordVisible ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="cursor-pointer" onClick={handleEditSave}>
                    Save Changes
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </main>
        </div>
      </SignedIn>
    </>
  );
}
