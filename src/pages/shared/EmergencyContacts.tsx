/**
 * EmergencyContacts
 *
 * Emergency contacts are currently stored locally on this device.
 * Native Contact Picker is capability-detected where supported.
 *
 * TODO (backend):
 * Persist contacts to Supabase and connect them to the real SOS
 * notification flow.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import MobileLayout from "@/components/MobileLayout";
import {
  ArrowLeft,
  Phone,
  Plus,
  Trash2,
  Shield,
  UserCircle,
  Smartphone,
  Info,
  Loader2,
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  phone: string;
  role: "primary" | "secondary" | "emergency";
}

interface EmergencyContactsProps {
  role: "user" | "caregiver";
}

interface ContactsManager {
  select(
    properties: string[],
    options?: { multiple?: boolean },
  ): Promise<
    Array<{
      name?: string[];
      tel?: string[];
    }>
  >;
}

const STORAGE_KEY =
  "neurospeak_emergency_contacts";

const MAX_CONTACTS = 10;

const ALLOWED_PHONE_CHARS =
  /^[0-9+()\-\s.]+$/;

const roleLabels: Record<
  Contact["role"],
  {
    label: string;
    className: string;
  }
> = {
  primary: {
    label: "Primary",
    className:
      "bg-primary/10 text-primary",
  },
  secondary: {
    label: "Secondary",
    className:
      "bg-accent text-accent-foreground",
  },
  emergency: {
    label: "Emergency",
    className:
      "bg-destructive/10 text-destructive",
  },
};

/* ================================================================
   LOCAL STORAGE
================================================================ */

function loadContacts(): Contact[] {
  try {
    const stored =
      localStorage.getItem(
        STORAGE_KEY,
      );

    if (!stored) return [];

    const parsed = JSON.parse(
      stored,
    );

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function saveContacts(
  contacts: Contact[],
) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(contacts),
    );
  } catch {
    // Storage failure should not break the UI.
  }
}

/* ================================================================
   CONTACT PICKER SUPPORT
================================================================ */

function isContactPickerSupported(): boolean {
  if (
    typeof navigator ===
    "undefined"
  ) {
    return false;
  }

  const contacts = (
    navigator as unknown as {
      contacts?: ContactsManager;
    }
  ).contacts;

  return (
    !!contacts &&
    typeof contacts.select ===
    "function"
  );
}

/* ================================================================
   COMPONENT
================================================================ */

const EmergencyContacts = ({
  role,
}: EmergencyContactsProps) => {
  const navigate = useNavigate();

  const [contacts, setContacts] =
    useState<Contact[]>([]);

  const [showAdd, setShowAdd] =
    useState(false);

  const [newName, setNewName] =
    useState("");

  const [newPhone, setNewPhone] =
    useState("");

  const [newRole, setNewRole] =
    useState<Contact["role"]>(
      "secondary",
    );

  const [pickerError, setPickerError] =
    useState<string | null>(null);

  const [
    isPickerLoading,
    setIsPickerLoading,
  ] = useState(false);

  const contactPickerAvailable =
    isContactPickerSupported();

  /* ================================================================
     LOAD
  ================================================================ */

  useEffect(() => {
    setContacts(loadContacts());
  }, []);

  /* ================================================================
     ADD MANUALLY
  ================================================================ */

  const addContact = () => {
    const name =
      newName.trim();

    const phone =
      newPhone.trim();

    if (!name || !phone) return;

    if (
      !ALLOWED_PHONE_CHARS.test(
        phone,
      )
    ) {
      return;
    }

    if (
      contacts.length >=
      MAX_CONTACTS
    ) {
      return;
    }

    const contact: Contact = {
      id:
        crypto.randomUUID?.() ??
        `${Date.now()}-${Math.random()}`,
      name,
      phone,
      role: newRole,
    };

    const updated = [
      ...contacts,
      contact,
    ];

    setContacts(updated);
    saveContacts(updated);

    setNewName("");
    setNewPhone("");
    setNewRole("secondary");
    setShowAdd(false);
  };

  /* ================================================================
     REMOVE
  ================================================================ */

  const removeContact = (
    id: string,
  ) => {
    const updated =
      contacts.filter(
        (contact) =>
          contact.id !== id,
      );

    setContacts(updated);
    saveContacts(updated);
  };

  /* ================================================================
     CONTACT PICKER
  ================================================================ */

  const handleImportFromContacts =
    async () => {
      if (
        !contactPickerAvailable ||
        contacts.length >=
        MAX_CONTACTS
      ) {
        return;
      }

      setPickerError(null);
      setIsPickerLoading(true);

      try {
        const picker = (
          navigator as unknown as {
            contacts: ContactsManager;
          }
        ).contacts;

        const selected =
          await picker.select(
            ["name", "tel"],
            {
              multiple: true,
            },
          );

        if (
          !selected ||
          selected.length === 0
        ) {
          return;
        }

        const remainingSlots =
          MAX_CONTACTS -
          contacts.length;

        const imported =
          selected
            .filter(
              (contact) =>
                contact.name?.[0] &&
                contact.tel?.[0],
            )
            .slice(
              0,
              remainingSlots,
            )
            .map(
              (contact) => ({
                id:
                  crypto.randomUUID?.() ??
                  `${Date.now()}-${Math.random()}`,
                name:
                  contact.name![0].trim(),
                phone:
                  contact.tel![0].trim(),
                role:
                  "secondary" as const,
              }),
            );

        if (
          imported.length === 0
        ) {
          setPickerError(
            "The selected contacts did not include a name and phone number.",
          );
          return;
        }

        const updated = [
          ...contacts,
          ...imported,
        ];

        setContacts(updated);
        saveContacts(updated);

        if (
          selected.length >
          remainingSlots
        ) {
          setPickerError(
            `Only ${remainingSlots} contact${remainingSlots === 1 ? "" : "s"} could be added.`,
          );
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name ===
          "AbortError"
        ) {
          return;
        }

        setPickerError(
          "Unable to import contacts. You can add the contact manually.",
        );
      } finally {
        setIsPickerLoading(false);
      }
    };

  const canAddMore =
    contacts.length <
    MAX_CONTACTS;

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
            onClick={() =>
              navigate(-1)
            }
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
              Emergency Contacts
            </h1>

            <p className="mt-0.5 text-[10px] text-muted-foreground sm:text-xs">
              People to reach during an emergency
            </p>
          </div>
        </div>

        {/* ============================================================
            INFO
        ============================================================ */}

        <div
          className="
            mb-4
            flex
            min-w-0
            items-start
            gap-2.5
            rounded-2xl
            border
            border-primary/20
            bg-primary/5
            px-3
            py-2.5
            sm:px-4
            sm:py-3
          "
        >
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

          <p className="min-w-0 text-[10px] leading-4 text-muted-foreground sm:text-xs">
            These contacts are currently saved on this device.
            The actual SOS notification flow will use them once
            backend notification support is connected.
          </p>
        </div>

        {/* ============================================================
            CONTACT PICKER
        ============================================================ */}

        {contactPickerAvailable ? (
          <motion.button
            initial={{
              opacity: 0,
              y: 5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            type="button"
            onClick={
              handleImportFromContacts
            }
            disabled={
              isPickerLoading ||
              !canAddMore
            }
            className="
              mb-3
              flex
              w-full
              min-w-0
              items-center
              gap-3
              rounded-2xl
              border
              border-border
              bg-card
              p-3
              text-left
              shadow-card
              transition
              hover:border-primary/40
              disabled:cursor-not-allowed
              disabled:opacity-60
              sm:p-3.5
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-primary/10
              "
            >
              {isPickerLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <Smartphone className="h-4 w-4 text-primary" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                {isPickerLoading
                  ? "Importing contacts…"
                  : "Import from Contacts"}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-muted-foreground sm:text-[10px]">
                Choose contacts from your device
              </p>
            </div>

            <span className="shrink-0 text-[9px] font-medium text-primary">
              Import
            </span>
          </motion.button>
        ) : (
          <div
            className="
              mb-3
              flex
              min-w-0
              items-start
              gap-2
              rounded-xl
              border
              border-border
              bg-muted/40
              px-3
              py-2.5
            "
          >
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

            <p className="min-w-0 text-[9px] leading-4 text-muted-foreground sm:text-[10px]">
              Device contact import is not available on this
              platform. Use manual add below.
            </p>
          </div>
        )}

        {/* ============================================================
            PICKER ERROR
        ============================================================ */}

        {pickerError && (
          <div
            className="
              mb-3
              rounded-xl
              border
              border-destructive/20
              bg-destructive/10
              px-3
              py-2
            "
          >
            <p className="text-[9px] leading-4 text-destructive sm:text-[10px]">
              {pickerError}
            </p>
          </div>
        )}

        {/* ============================================================
            CONTACT COUNT
        ============================================================ */}

        <div
          className="
            mb-2
            flex
            items-center
            justify-between
            px-1
          "
        >
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-wider
              text-muted-foreground
            "
          >
            Saved Contacts
          </p>

          <span className="text-[9px] text-muted-foreground">
            {contacts.length}/{MAX_CONTACTS}
          </span>
        </div>

        {/* ============================================================
            CONTACT LIST
        ============================================================ */}

        <div className="space-y-2">
          {contacts.length === 0 && (
            <div
              className="
                flex
                min-h-[150px]
                flex-col
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-border
                bg-muted/30
                px-5
                text-center
              "
            >
              <div
                className="
                  mb-2
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-muted
                "
              >
                <UserCircle className="h-6 w-6 text-muted-foreground/40" />
              </div>

              <p className="text-xs font-medium text-muted-foreground">
                No emergency contacts yet
              </p>

              <p className="mt-1 max-w-xs text-[9px] leading-4 text-muted-foreground">
                Add someone you trust to keep them available
                for your emergency workflow.
              </p>
            </div>
          )}

          {contacts.map(
            (
              contact,
              index,
            ) => {
              const roleInfo =
                roleLabels[
                contact.role
                ];

              return (
                <motion.div
                  key={contact.id}
                  initial={{
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      index * 0.03,
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
                    px-3
                    py-2.5
                    shadow-card
                    sm:px-4
                  "
                >
                  {/* Avatar */}

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-gradient-primary
                    "
                  >
                    <span className="text-sm font-bold text-primary-foreground">
                      {contact.name
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>

                  {/* Details */}

                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <p className="min-w-0 truncate text-xs font-semibold text-card-foreground sm:text-sm">
                        {contact.name}
                      </p>

                      <span
                        className={`
                          shrink-0
                          rounded-full
                          px-1.5
                          py-0.5
                          text-[8px]
                          font-semibold
                          ${roleInfo.className}
                        `}
                      >
                        {roleInfo.label}
                      </span>
                    </div>

                    <div
                      className="
                        mt-0.5
                        flex
                        min-w-0
                        items-center
                        gap-1
                        text-[9px]
                        text-muted-foreground
                      "
                    >
                      <Phone className="h-3 w-3 shrink-0" />

                      <span className="truncate">
                        {contact.phone}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}

                  <button
                    type="button"
                    onClick={() =>
                      removeContact(
                        contact.id,
                      )
                    }
                    aria-label={`Remove ${contact.name}`}
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      text-muted-foreground
                      transition
                      hover:bg-destructive/10
                      hover:text-destructive
                    "
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            },
          )}
        </div>

        {/* ============================================================
            ADD SECTION
        ============================================================ */}

        {canAddMore && (
          <>
            {!showAdd ? (
              <button
                type="button"
                onClick={() =>
                  setShowAdd(true)
                }
                className="
                  mt-3
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-dashed
                  border-border
                  text-xs
                  font-medium
                  text-muted-foreground
                  transition
                  hover:border-primary
                  hover:bg-primary/5
                  hover:text-primary
                "
              >
                <Plus className="h-4 w-4" />
                Add Manually
              </button>
            ) : (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="
                  mt-3
                  rounded-2xl
                  border
                  border-border
                  bg-card
                  p-3
                  shadow-card
                  sm:p-4
                "
              >
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-card-foreground sm:text-sm">
                    Add Contact
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAdd(
                        false,
                      )
                    }
                    className="
                      flex
                      h-7
                      w-7
                      items-center
                      justify-center
                      rounded-full
                      text-muted-foreground
                      hover:bg-muted
                    "
                    aria-label="Close"
                  >
                    <XIcon />
                  </button>
                </div>

                {/* Name */}

                <input
                  value={newName}
                  onChange={(e) =>
                    setNewName(
                      e.target.value,
                    )
                  }
                  placeholder="Full name"
                  autoComplete="name"
                  className="
                    mb-2
                    h-10
                    w-full
                    rounded-xl
                    bg-muted
                    px-3
                    text-xs
                    text-foreground
                    outline-none
                    placeholder:text-muted-foreground
                    focus:ring-2
                    focus:ring-primary
                    sm:text-sm
                  "
                />

                {/* Phone */}

                <input
                  value={newPhone}
                  onChange={(e) =>
                    setNewPhone(
                      e.target.value,
                    )
                  }
                  placeholder="Phone number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="
                    mb-3
                    h-10
                    w-full
                    rounded-xl
                    bg-muted
                    px-3
                    text-xs
                    text-foreground
                    outline-none
                    placeholder:text-muted-foreground
                    focus:ring-2
                    focus:ring-primary
                    sm:text-sm
                  "
                />

                {/* Role */}

                <p className="mb-1.5 text-[9px] font-medium text-muted-foreground">
                  Contact type
                </p>

                <div className="mb-3 grid grid-cols-3 gap-1.5">
                  {(
                    [
                      "primary",
                      "secondary",
                      "emergency",
                    ] as const
                  ).map(
                    (contactRole) => (
                      <button
                        key={
                          contactRole
                        }
                        type="button"
                        onClick={() =>
                          setNewRole(
                            contactRole,
                          )
                        }
                        className={`
                          rounded-lg
                          py-2
                          text-[9px]
                          font-medium
                          capitalize
                          transition
                          sm:text-[10px]
                          ${newRole ===
                            contactRole
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }
                        `}
                      >
                        {contactRole}
                      </button>
                    ),
                  )}
                </div>

                {/* Actions */}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdd(
                        false,
                      );
                      setNewName("");
                      setNewPhone("");
                    }}
                    className="
                      h-10
                      rounded-xl
                      bg-muted
                      text-xs
                      font-medium
                      text-muted-foreground
                      transition
                      hover:bg-muted/80
                    "
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={
                      addContact
                    }
                    disabled={
                      !newName.trim() ||
                      !newPhone.trim() ||
                      !ALLOWED_PHONE_CHARS.test(
                        newPhone.trim(),
                      )
                    }
                    className="
                      h-10
                      rounded-xl
                      bg-gradient-primary
                      text-xs
                      font-semibold
                      text-primary-foreground
                      transition
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    Add Contact
                  </button>
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Limit */}

        {!canAddMore && (
          <p className="mt-3 text-center text-[9px] text-muted-foreground">
            Maximum of {MAX_CONTACTS} emergency contacts reached.
          </p>
        )}
      </div>
    </MobileLayout>
  );
};

/* Small local icon wrapper keeps the main imports clean. */
const XIcon = () => (
  <span className="text-sm leading-none">
    ×
  </span>
);

export default EmergencyContacts;