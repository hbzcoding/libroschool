<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreConversationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'recipient_id' => ['required', 'integer', 'exists:users,id'],
            'book_id' => ['nullable', 'integer', 'exists:books,id'],
            'book_request_id' => ['nullable', 'integer', 'exists:book_requests,id'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'recipient_id.required' => 'Recipient is required.',
            'recipient_id.exists' => 'Recipient user does not exist.',
            'book_id.exists' => 'Book does not exist.',
            'book_request_id.exists' => 'Book request does not exist.',
        ];
    }

    /**
     * Get the "after" validation callables for the request.
     *
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (\Illuminate\Validation\Validator $validator) {
                // Check that recipient is not the same as the authenticated user
                if ($this->recipient_id === $this->user()->id) {
                    $validator->errors()->add(
                        'recipient_id',
                        'You cannot start a conversation with yourself.'
                    );
                }

                $bookId = $this->input('book_id');
                $bookRequestId = $this->input('book_request_id');

                if (empty($bookId) && empty($bookRequestId)) {
                    $validator->errors()->add(
                        'book_id',
                        'At least one of book_id or book_request_id is required.'
                    );
                }
            }
        ];
    }
}