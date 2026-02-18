# Exchange Lifecycle

This document describes the state machine and valid transitions for an Exchange in the ToyShare application.

## 1. Statuses

The `Exchange` model uses the `ExchangeStatus` enum (implied string in Prisma):

- **PROPOSED**: Initial state. User A proposes an exchange to User B.
- **ACCEPTED**: User B accepts the proposal. Contact details are revealed.
- **IN_PROGRESS**: Shipping details have been added (or confirmed).
- **COMPLETED**: Both users have confirmed completion (or fulfilled conditions).
- **REJECTED**: User B rejected the proposal.
- **CANCELLED**: User A cancelled the proposal, or system cancelled it due to item conflict.

## 2. State Transitions

### PROPOSED
- **-> ACCEPTED**: Receiver accepts.
- **-> REJECTED**: Receiver rejects.
- **-> CANCELLED**: Initiator cancels.

### ACCEPTED
- **-> IN_PROGRESS**: 
  - Automatically transitions when either user saves shipping details.
  - Automatically transitions when either user confirms shipping.

### IN_PROGRESS
- **-> COMPLETED**:
  - Requires **both** users to have `shippingConfirmed: true`.
  - Requires **both** users to mark as completed (via `initiatorCompleted` / `receiverCompleted` flags).
  - When the second user confirms completion, the status updates to `COMPLETED`.

### COMPLETED
- Final state.
- Triggers rating capability.
- Items involved are marked `isAvailable: false`.
- Any other pending proposals involving these items are `CANCELLED`.

## 3. Shipping Logic
- **Editing**: Both users can edit shipping details (date, post office, note) as long as they haven't "Confirmed" shipping yet.
- **Confirmation**: Users must individually confirm shipping. Once confirmed, they cannot edit details anymore.

## 4. Notifications
Notifications are sent to the *other* party upon:
- Proposal creation
- Status change (Accept/Reject)
- Shipping details update
- Shipping confirmation
- Completion confirmation
