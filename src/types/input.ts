export type ValueType = [Date | null, Date | null] | null;

export interface WithAsProps<
  As extends React.ElementType | string = React.ElementType
> {
  /** You can use a custom element for this component */
  as?: As;
}

/**
 * Prepend arguments to function
 * Useful for prepend `newValue` arg to native `onChange` callbacks
 *
 * @see https://stackoverflow.com/a/69668215
 * @example
 *
 * type SomeFunc = (a: string, b: number, c: someCustomType) => number;
 * type SomeFuncAltered = PrependParameters<SomeFunc, [d: number]>;
 * // SomeFuncAltered = (d: number, a:string, b:number, c:someCustomType) => number;
 */
export type PrependParameters<
  TFunction extends (...args: any) => any,
  TParameters extends [...args: any]
> = (
  ...args: [...TParameters, ...Parameters<TFunction>]
) => ReturnType<TFunction>;

export interface FormControlBaseProps<
  ValueType = React.InputHTMLAttributes<HTMLInputElement>["value"]
> {
  /** Name of the form field */
  name?: string;

  /** Initial value */
  defaultValue?: ValueType;

  /** Current value of the component. Creates a controlled component */
  value?: ValueType;

  /**
   * Called after the value has been changed
   * todo Override event as React.ChangeEvent in components where onChange is delegated
   *      to an underlying <input> element
   */
  onChange?: (value: ValueType, event: React.SyntheticEvent) => void;

  /** Set the component to be disabled and cannot be entered */
  disabled?: boolean;

  /** Render the control as plain text */
  plaintext?: boolean;

  /** Make the control readonly */
  readOnly?: boolean;
}

export interface InputProps
  extends WithAsProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "size">,
    Omit<FormControlBaseProps, "onChange"> {
  /** The HTML input type */
  type?: string;

  /** The HTML input id */
  id?: string;

  /** Ref of input element */
  inputRef?: React.Ref<any>;

  /**
   * The htmlSize attribute defines the width of the <input> element.
   *
   * @see MDN https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/size
   * @version 5.49.0
   */
  htmlSize?: number;

  /**
   * The callback function in which value is changed.
   */
  onChange?: PrependParameters<
    React.ChangeEventHandler<HTMLInputElement>,
    [value: string]
  >;

  /** Called on press enter */
  onPressEnter?: React.KeyboardEventHandler<HTMLInputElement>;
}

export interface DateRangeInputProps
  extends Omit<InputProps, "value" | "onChange" | "defaultValue">,
    FormControlBaseProps<ValueType> {
  /**
   * The character between the start and end dates.
   * @default ' ~ '
   **/
  character?: string;

  /**
   * Format of the date when rendered in the input. Format of the string is based on Unicode Technical Standard.
   *
   * @see https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
   * @default 'yyyy-MM-dd'
   **/
  format?: string;

  /**
   * The `placeholder` prop defines the text displayed in a form control when the control has no value.
   */
  placeholder?: string;
}
