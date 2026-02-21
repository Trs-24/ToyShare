import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ProposeExchangeModal from '@/components/ProposeExchangeModal';
import { LanguageProvider } from '@/context/LanguageContext';
import { api } from '@/lib/api';

// Mock the API calls
jest.mock('@/lib/api', () => ({
  api: {
    users: {
      getProfile: jest.fn(),
    },
    items: {
      list: jest.fn(),
    },
    exchanges: {
      create: jest.fn(),
    },
  },
}));

const mockTargetItem = {
  id: 'target-item-id',
  title: 'Target Toy',
};

const mockMyItem = {
  id: 'my-item-id',
  title: 'My Toy',
  photos: [],
};

describe('ProposeExchangeModal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (api.users.getProfile as jest.Mock).mockResolvedValue({ id: 'my-user-id' });
    (api.items.list as jest.Mock).mockResolvedValue({ items: [mockMyItem] });
    (api.exchanges.create as jest.Mock).mockResolvedValue({});

    // Mock window.alert
    jest.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderModal = async (isOpen = true) => {
    let result: ReturnType<typeof render>;
    await act(async () => {
      result = render(
        <LanguageProvider>
          <ProposeExchangeModal isOpen={isOpen} onClose={mockOnClose} targetItem={mockTargetItem} />
        </LanguageProvider>,
      );
    });
    return result!;
  };

  it('does not render when isOpen is false', async () => {
    const { container } = await renderModal(false);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders and loads my items when opened', async () => {
    await renderModal(true);

    // The heading should be in document
    expect(screen.getByRole('heading', { name: /Запропонувати обмін/i })).toBeInTheDocument();

    // It should load the items
    await waitFor(() => {
      expect(api.items.list).toHaveBeenCalledWith({ ownerId: 'my-user-id' });
    });

    // My item should appear
    expect(await screen.findByText('My Toy')).toBeInTheDocument();
  });

  it('allows selecting an item and submitting a proposal', async () => {
    await renderModal(true);

    // Wait for items to load
    const myItemElement = await screen.findByText('My Toy');

    // Select the item
    fireEvent.click(myItemElement);

    // Submit the proposal via the submit button
    const submitBtn = screen.getByRole('button', { name: /Запропонувати обмін/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.exchanges.create).toHaveBeenCalledWith({
        offeredItemId: 'my-item-id',
        requestedItemId: 'target-item-id',
        note: '',
      });
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('disables submit button if no item is selected', async () => {
    await renderModal(true);

    // Submit btn should be disabled initially (before item selection)
    const submitBtn = await screen.findByRole('button', { name: /Запропонувати обмін/i });
    expect(submitBtn).toBeDisabled();

    // Select the item
    const myItemElement = await screen.findByText('My Toy');
    fireEvent.click(myItemElement);

    // Submit btn should become enabled
    expect(submitBtn).not.toBeDisabled();
  });
});
