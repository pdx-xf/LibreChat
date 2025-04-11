import React, { useState } from 'react';
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { GearIcon } from '~/components/svg';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';
import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDownIcon } from '@radix-ui/react-icons';

interface MenuSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MenuSettings({ open, onOpenChange }: MenuSettingsProps) {
  const localize = useLocalize();
  const [activeTab, setActiveTab] = useState('1');

  const menuItems = [
    { id: '1', label: '1' },
    { id: '2', label: '2' },
    { id: '3', label: '3' },
  ];

  return (
    <Transition appear show={open}>
      <Dialog as="div" className="relative z-50" onClose={() => onOpenChange(false)}>
        <TransitionChild
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black opacity-50 dark:opacity-80" aria-hidden="true" />
        </TransitionChild>

        <TransitionChild
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
            <DialogPanel className="min-h-[600px] w-full max-w-2xl overflow-hidden rounded-xl bg-background p-6 shadow-2xl backdrop-blur-2xl">
              <DialogTitle className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-text-primary">
                  {localize('com_nav_settings')}
                </h2>
                <button
                  type="button"
                  className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-border-xheavy focus:ring-offset-2 disabled:pointer-events-none"
                  onClick={() => onOpenChange(false)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 text-text-primary"
                  >
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                  <span className="sr-only">{localize('com_ui_close')}</span>
                </button>
              </DialogTitle>

              <div className="space-y-4">
                <Accordion.Root
                  type="single"
                  collapsible
                  className="w-full space-y-2"
                  value={activeTab}
                  onValueChange={setActiveTab}
                >
                  {menuItems.map((item) => (
                    <Accordion.Item
                      key={item.id}
                      value={item.id}
                      className="overflow-hidden rounded-lg border border-border-light dark:border-gray-700"
                    >
                      <Accordion.Header>
                        <Accordion.Trigger className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-secondary dark:hover:bg-gray-800">
                          <span className="font-medium text-text-primary">
                            {localize(item.label)}
                          </span>
                          <ChevronDownIcon className="h-4 w-4 text-text-primary transition-transform duration-200 group-data-[state=open]:rotate-180" />
                        </Accordion.Trigger>
                      </Accordion.Header>
                      <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="bg-surface-primary p-4 dark:bg-gray-900">
                          {item.id === '1' && (
                            <div className="text-text-primary">
                              {localize('com_nav_setting_general')}
                            </div>
                          )}
                          {item.id === '2' && (
                            <div className="text-text-primary">{localize('com_nav_theme')}</div>
                          )}
                          {item.id === '3' && (
                            <div className="text-text-primary">{localize('com_nav_settings')}</div>
                          )}
                        </div>
                      </Accordion.Content>
                    </Accordion.Item>
                  ))}
                </Accordion.Root>
              </div>
            </DialogPanel>
          </div>
        </TransitionChild>
      </Dialog>
    </Transition>
  );
}
