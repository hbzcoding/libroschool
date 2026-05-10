<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassroomRequest extends FormRequest
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
            'school_id' => ['required', 'exists:schools,id'],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'grade' => ['required', 'string', 'max:20'],
            'section' => ['required', 'string', 'max:10'],
            'track' => ['nullable', 'string', 'max:100'],
            'academic_year' => ['required', 'string', 'max:20'],
            'join_policy' => ['nullable', 'string', 'in:open,code,approval'],
            'visibility' => ['nullable', 'string', 'in:public,private'],
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'join_policy' => $this->join_policy ?? 'code',
            'visibility' => $this->visibility ?? 'private',
        ]);
    }
}
