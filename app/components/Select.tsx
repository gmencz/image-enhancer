import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { Fragment } from "react";

interface SelectProps {
  options: string[];
  label: string;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
  description?: string;
  labelClassName?: string;
  onChange?: (selected: string) => void;
}

export function Select({
  options,
  label,
  selected,
  setSelected,
  description,
  labelClassName,
  onChange,
}: SelectProps) {
  return (
    <>
      <Listbox
        value={selected}
        onChange={(v) => {
          setSelected(v);
          onChange?.(v);
        }}
      >
        {({ open }) => (
          <>
            <Listbox.Label
              className={clsx(
                "block text-sm font-medium text-gray-700",
                labelClassName && labelClassName
              )}
            >
              {label}
            </Listbox.Label>
            <div className="relative mt-1">
              <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 sm:text-sm">
                <span className="block truncate">{selected}</span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronUpDownIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </span>
              </Listbox.Button>

              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {options.map((option) => (
                    <Listbox.Option
                      key={option}
                      className={({ active }) =>
                        clsx(
                          active ? "text-white bg-purple-600" : "text-gray-900",
                          "relative cursor-default select-none py-2 pl-3 pr-9"
                        )
                      }
                      value={option}
                    >
                      {({ selected, active }) => (
                        <>
                          <span
                            className={clsx(
                              selected ? "font-semibold" : "font-normal",
                              "block truncate"
                            )}
                          >
                            {option}
                          </span>

                          {selected ? (
                            <span
                              className={clsx(
                                active ? "text-white" : "text-purple-600",
                                "absolute inset-y-0 right-0 flex items-center pr-4"
                              )}
                            >
                              <CheckIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </span>
                          ) : null}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>

            {description ? (
              <p className="mt-2 text-sm text-gray-500" id="email-description">
                {description}
              </p>
            ) : null}
          </>
        )}
      </Listbox>
    </>
  );
}
