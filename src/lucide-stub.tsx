import React from 'react';

// Create a stub icon component for any requested icon
const createIconStub = (name: string) => {
  const IconStub = (props: any) => (
    <div 
      {...props} 
      title={name}
      style={{ 
        width: 24, 
        height: 24, 
        border: '1px solid #ccc', 
        display: 'inline-block',
        ...props.style 
      }} 
    />
  );
  IconStub.displayName = name;
  return IconStub;
};

// Create a proxy that dynamically exports any icon
const handler: ProxyHandler<{}> = {
  get: (target, prop) => {
    if (typeof prop === 'string') {
      return createIconStub(prop);
    }
    return undefined;
  }
};

export default new Proxy({}, handler) as any;

// Also export individually for named imports
export const Loader2 = createIconStub('Loader2');
export const X = createIconStub('X');
export const Mail = createIconStub('Mail');
export const Lock = createIconStub('Lock');
export const User = createIconStub('User');
export const Eye = createIconStub('Eye');
export const EyeOff = createIconStub('EyeOff');
export const ArrowRight = createIconStub('ArrowRight');
export const Chrome = createIconStub('Chrome');
export const Shield = createIconStub('Shield');
export const Lightbulb = createIconStub('Lightbulb');
export const Briefcase = createIconStub('Briefcase');
export const Users = createIconStub('Users');
export const UserCheck = createIconStub('UserCheck');
export const CheckCircle = createIconStub('CheckCircle');
export const AlertCircle = createIconStub('AlertCircle');
export const GraduationCap = createIconStub('GraduationCap');
export const Building2 = createIconStub('Building2');
export const Loader = createIconStub('Loader');
export const Sun = createIconStub('Sun');
export const Moon = createIconStub('Moon');
