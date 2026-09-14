import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MobileLayout from "@/components/MobileLayout";
import {
  ArrowLeft,
  Camera,
  Save,
  User,
  Mail,
  Globe,
  Shield,
  Loader2,
  X,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EditProfileProps {
  role: "user" | "caregiver";
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

const EditProfile = ({
  role,
}: EditProfileProps) => {
  const navigate = useNavigate();

  const {
    userName,
    userEmail,
    userId,
    avatarUrl,
    setAvatarUrl,
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    setSpeechRate,
  } = useApp();

  const { toast } = useToast();

  const [name, setName] = useState(
    userName || "",
  );

  const [language, setLanguage] =
    useState("English");

  const [speechSpeed, setSpeechSpeed] =
    useState<"slow" | "normal" | "fast">(
      "normal",
    );

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(avatarUrl);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploadError, setUploadError] =
    useState<string | null>(null);

  const [isUploading, setIsUploading] =
    useState(false);

  const [isSaving, setIsSaving] =
    useState(false);

  /* ================================================================
     IMAGE SELECTION
  ================================================================ */

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setUploadError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError(
        "Only JPEG, PNG, WebP, or GIF images are supported.",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(
        "Image must be smaller than 5 MB.",
      );
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      if (
        typeof event.target?.result ===
        "string"
      ) {
        setPreviewUrl(
          event.target.result,
        );
      }
    };

    reader.readAsDataURL(file);
  };

  /* ================================================================
     UPLOAD
  ================================================================ */

  const uploadAvatar =
    async (): Promise<string | null> => {
      if (!selectedFile || !userId) {
        return avatarUrl;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        const ext =
          selectedFile.name
            .split(".")
            .pop() || "jpg";

        const path = `${userId}/avatar.${ext}`;

        const {
          error: storageError,
        } = await supabase.storage
          .from("avatars")
          .upload(
            path,
            selectedFile,
            {
              upsert: true,
              contentType:
                selectedFile.type,
            },
          );

        if (storageError) {
          if (
            storageError.message
              .toLowerCase()
              .includes("bucket")
          ) {
            setUploadError(
              "Profile image storage is not configured yet.",
            );
          } else {
            setUploadError(
              `Upload failed: ${storageError.message}`,
            );
          }

          return null;
        }

        const {
          data: urlData,
        } = supabase.storage
          .from("avatars")
          .getPublicUrl(path);

        return urlData.publicUrl;
      } finally {
        setIsUploading(false);
      }
    };

  /* ================================================================
     SAVE
  ================================================================ */

  const handleSave = async () => {
    setIsSaving(true);

    try {
      let newAvatarUrl = avatarUrl;

      if (selectedFile) {
        newAvatarUrl =
          await uploadAvatar();

        if (
          !newAvatarUrl &&
          uploadError
        ) {
          setIsSaving(false);
          return;
        }
      }

      const updates: Record<
        string,
        string
      > = {};

      const trimmedName =
        name.trim();

      if (
        trimmedName &&
        trimmedName !== userName
      ) {
        updates.full_name =
          trimmedName;
      }

      if (
        newAvatarUrl &&
        newAvatarUrl !== avatarUrl
      ) {
        updates.avatar_url =
          newAvatarUrl;
      }

      if (
        Object.keys(updates).length > 0
      ) {
        const {
          error,
        } = await supabase.auth.updateUser(
          {
            data: updates,
          },
        );

        if (error) {
          toast({
            title: "Couldn't save changes",
            description:
              error.message,
            variant: "destructive",
          });

          setIsSaving(false);
          return;
        }

        if (updates.avatar_url) {
          setAvatarUrl(
            updates.avatar_url,
          );
        }
      }

      const rateMap = {
        slow: 0.7,
        normal: 0.9,
        fast: 1.2,
      };

      setSpeechRate(
        rateMap[speechSpeed],
      );

      toast({
        title: "Profile Updated",
        description:
          "Your changes have been saved.",
      });

      navigate(-1);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description:
          error instanceof Error
            ? error.message
            : "Unable to save your changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  /* ================================================================
     REMOVE SELECTED PHOTO
  ================================================================ */

  const removePhoto = () => {
    setPreviewUrl(avatarUrl);
    setSelectedFile(null);
    setUploadError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const initials = name
    ? name[0].toUpperCase()
    : "?";

  return (
    <MobileLayout role={role}>
      <div
        className="
          mx-auto
          w-full
          max-w-2xl
          min-w-0
          overflow-x-hidden
          px-4
          pb-20
          pt-4
          sm:px-5
          lg:px-6
          lg:pb-6
        "
      >
        {/* ============================================================
            HEADER
        ============================================================ */}

        <div
          className="
            mb-4
            flex
            items-center
            gap-2.5
          "
        >
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-primary/10
              text-primary
              transition
              hover:bg-primary/20
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="min-w-0">
            <h1
              className="
                truncate
                text-xl
                font-bold
                tracking-tight
                text-foreground
                sm:text-2xl
              "
            >
              Edit Profile
            </h1>

            <p className="mt-0.5 truncate text-[10px] text-muted-foreground sm:text-xs">
              Update your account details
            </p>
          </div>
        </div>

        {/* ============================================================
            PROFILE PHOTO
        ============================================================ */}

        <motion.div
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            flex
            min-w-0
            items-center
            gap-3
            rounded-2xl
            border
            border-border
            bg-card
            p-3
            shadow-card
            sm:p-4
          "
        >
          <div className="relative shrink-0">
            <div
              className="
                flex
                h-16
                w-16
                items-center
                justify-center
                overflow-hidden
                rounded-full
                bg-gradient-primary
                sm:h-20
                sm:w-20
              "
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-primary-foreground">
                  {initials}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              aria-label="Change profile photo"
              className="
                absolute
                bottom-0
                right-0
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                border
                border-border
                bg-card
                shadow-card
                transition
                hover:bg-muted
              "
            >
              <Camera className="h-3.5 w-3.5 text-primary" />
            </button>

            {selectedFile && (
              <button
                type="button"
                onClick={removePhoto}
                aria-label="Remove selected photo"
                className="
                  absolute
                  -right-1
                  -top-1
                  flex
                  h-5
                  w-5
                  items-center
                  justify-center
                  rounded-full
                  bg-destructive
                "
              >
                <X className="h-2.5 w-2.5 text-destructive-foreground" />
              </button>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-card-foreground sm:text-sm">
              Profile Photo
            </p>

            <p className="mt-0.5 text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
              JPG, PNG, WebP or GIF · Max 5 MB
            </p>

            {selectedFile && (
              <p className="mt-1 truncate text-[9px] font-medium text-primary">
                New photo selected
              </p>
            )}

            {uploadError && (
              <div className="mt-2 flex min-w-0 items-start gap-1.5 rounded-lg bg-destructive/10 px-2 py-1.5">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0 text-destructive" />

                <p className="min-w-0 break-words text-[9px] leading-4 text-destructive">
                  {uploadError}
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFileChange}
          />
        </motion.div>

        {/* ============================================================
            PERSONAL INFORMATION
        ============================================================ */}

        <p
          className="
            mb-2
            mt-4
            px-1
            text-[9px]
            font-semibold
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          Personal Information
        </p>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            shadow-card
          "
        >
          {/* Name */}

          <div
            className="
              border-b
              border-border
              px-3
              py-3
              sm:px-4
            "
          >
            <div className="mb-1.5 flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />

              <span className="text-[10px] text-muted-foreground sm:text-xs">
                Display Name
              </span>
            </div>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Your name"
              className="
                w-full
                bg-transparent
                text-xs
                font-medium
                text-foreground
                outline-none
                placeholder:text-muted-foreground/50
                sm:text-sm
              "
            />
          </div>

          {/* Email */}

          <div
            className="
              px-3
              py-3
              sm:px-4
            "
          >
            <div className="mb-1.5 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-primary" />

              <span className="text-[10px] text-muted-foreground sm:text-xs">
                Email
              </span>
            </div>

            <p className="truncate text-xs font-medium text-foreground sm:text-sm">
              {userEmail || (
                <span className="italic text-muted-foreground">
                  Not available
                </span>
              )}
            </p>

            <p className="mt-0.5 text-[8px] text-muted-foreground sm:text-[9px]">
              Email cannot be changed here
            </p>
          </div>
        </div>

        {/* ============================================================
            COMMUNICATION
        ============================================================ */}

        <p
          className="
            mb-2
            mt-4
            px-1
            text-[9px]
            font-semibold
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          Communication
        </p>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            shadow-card
          "
        >
          {/* Language */}

          <div
            className="
              border-b
              border-border
              px-3
              py-3
              sm:px-4
            "
          >
            <div className="mb-2 flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-primary" />

              <span className="text-[10px] text-muted-foreground sm:text-xs">
                Language
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {[
                "English",
                "Spanish",
                "French",
              ].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() =>
                    setLanguage(lang)
                  }
                  className={`
                    rounded-lg
                    py-2
                    text-[10px]
                    font-medium
                    transition-all
                    sm:text-xs
                    ${language === lang
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Speech speed */}

          {role === "user" && (
            <div className="px-3 py-3 sm:px-4">
              <div className="mb-2 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5 text-primary" />

                <span className="text-[10px] text-muted-foreground sm:text-xs">
                  Speech Speed
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    "slow",
                    "normal",
                    "fast",
                  ] as const
                ).map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() =>
                      setSpeechSpeed(
                        speed,
                      )
                    }
                    className={`
                      rounded-lg
                      py-2
                      text-[10px]
                      font-medium
                      capitalize
                      transition-all
                      sm:text-xs
                      ${speechSpeed ===
                        speed
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }
                    `}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ============================================================
            ACCESSIBILITY
        ============================================================ */}

        <p
          className="
            mb-2
            mt-4
            px-1
            text-[9px]
            font-semibold
            uppercase
            tracking-wider
            text-muted-foreground
          "
        >
          Accessibility
        </p>

        <div
          className="
            overflow-hidden
            rounded-2xl
            border
            border-border
            bg-card
            shadow-card
          "
        >
          {/* Text size */}

          <div
            className="
              border-b
              border-border
              px-3
              py-3
              sm:px-4
            "
          >
            <span className="text-[10px] text-muted-foreground sm:text-xs">
              Text Size
            </span>

            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {(
                [
                  "normal",
                  "large",
                  "extra-large",
                ] as const
              ).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    setTextSize(size)
                  }
                  className={`
                    rounded-lg
                    py-2
                    text-[10px]
                    font-medium
                    transition-all
                    sm:text-xs
                    ${textSize === size
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  {size ===
                    "extra-large"
                    ? "XL"
                    : size === "large"
                      ? "L"
                      : "M"}
                </button>
              ))}
            </div>
          </div>

          {/* High contrast */}

          <button
            type="button"
            onClick={() =>
              setHighContrast(
                !highContrast,
              )
            }
            className="
              flex
              min-h-[52px]
              w-full
              items-center
              gap-3
              px-3
              text-left
              transition
              hover:bg-muted/40
              sm:px-4
            "
          >
            <span className="min-w-0 flex-1 text-xs font-medium text-card-foreground sm:text-sm">
              High Contrast
            </span>

            <div
              className={`
                relative
                h-5
                w-10
                shrink-0
                rounded-full
                transition-colors
                ${highContrast
                  ? "bg-primary"
                  : "bg-muted"
                }
              `}
            >
              <div
                className={`
                  absolute
                  top-0.5
                  h-4
                  w-4
                  rounded-full
                  bg-card
                  shadow
                  transition-transform
                  ${highContrast
                    ? "translate-x-5"
                    : "translate-x-0.5"
                  }
                `}
              />
            </div>
          </button>
        </div>

        {/* ============================================================
            SAVE
        ============================================================ */}

        <button
          type="button"
          onClick={handleSave}
          disabled={
            isSaving || isUploading
          }
          className="
            mt-4
            flex
            h-11
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-gradient-primary
            text-xs
            font-bold
            text-primary-foreground
            shadow-card
            transition
            active:scale-[0.99]
            disabled:cursor-not-allowed
            disabled:opacity-60
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-ring
            sm:text-sm
          "
        >
          {isUploading ||
            isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {isUploading
            ? "Uploading photo…"
            : isSaving
              ? "Saving…"
              : "Save Changes"}
        </button>
      </div>
    </MobileLayout>
  );
};

export default EditProfile;