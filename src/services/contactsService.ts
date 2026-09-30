import { getAccessToken } from '../utils/firebase';

export interface FarmContact {
  resourceName: string;
  etag?: string;
  name: string;
  phone?: string;
  email?: string;
  category?: string;
  organization?: string;
  photoUrl?: string;
}

export interface CreateContactInput {
  name: string;
  phone?: string;
  email?: string;
  category?: string;
  organization?: string;
}

// Fetch user's Google Contacts
export const fetchContacts = async (): Promise<FarmContact[]> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  const res = await fetch(
    'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,photos,organizations,userDefined&pageSize=100',
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!res.ok) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to fetch contacts (${res.status})`);
  }

  const data = await res.json();
  const connections = data.connections || [];

  return connections.map((c: any) => {
    const primaryName = c.names?.[0]?.displayName || 'Unnamed Contact';
    const primaryPhone = c.phoneNumbers?.[0]?.value || '';
    const primaryEmail = c.emailAddresses?.[0]?.value || '';
    const primaryOrg = c.organizations?.[0]?.name || c.organizations?.[0]?.title || '';
    const photo = c.photos?.[0]?.url || '';

    // Check custom field for farm category
    const userCat = c.userDefined?.find((u: any) => u.key === 'FarmCategory')?.value;

    return {
      resourceName: c.resourceName,
      etag: c.etag,
      name: primaryName,
      phone: primaryPhone,
      email: primaryEmail,
      category: userCat || (primaryOrg ? 'Agricultural Business' : 'Personal Contact'),
      organization: primaryOrg,
      photoUrl: photo,
    };
  });
};

// Create a new contact in Google Contacts
export const createContact = async (input: CreateContactInput): Promise<FarmContact> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  const body: any = {
    names: [{ givenName: input.name }],
  };

  if (input.phone) {
    body.phoneNumbers = [{ value: input.phone, type: 'mobile' }];
  }

  if (input.email) {
    body.emailAddresses = [{ value: input.email, type: 'work' }];
  }

  if (input.organization || input.category) {
    body.organizations = [{ name: input.organization || input.category, title: input.category }];
  }

  if (input.category) {
    body.userDefined = [{ key: 'FarmCategory', value: input.category }];
  }

  const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to create contact (${res.status})`);
  }

  const data = await res.json();
  return {
    resourceName: data.resourceName,
    etag: data.etag,
    name: input.name,
    phone: input.phone,
    email: input.email,
    category: input.category,
    organization: input.organization,
  };
};

// Delete a contact
export const deleteContact = async (resourceName: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) throw new Error('NOT_AUTHENTICATED');

  const res = await fetch(`https://people.googleapis.com/v1/${resourceName}:deleteContact`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204 && res.status !== 200) {
    if (res.status === 401) throw new Error('NOT_AUTHENTICATED');
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Failed to delete contact (${res.status})`);
  }

  return true;
};
